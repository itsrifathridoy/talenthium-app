package tech.talenthium.projectservice.util;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;

@Slf4j
@Component
public class GitHubTreeFormatter {

    /**
     * Formats GitHub tree API response into a hierarchical structure
     * with custom API URLs for file access
     */
    public Map<String, Object> formatTree(JsonNode treeResponse, String owner, String repo, String baseUrl) {
        Map<String, Object> result = new HashMap<>();
        
        String sha = treeResponse.get("sha").asText();
        JsonNode treeArray = treeResponse.get("tree");
        boolean truncated = treeResponse.get("truncated").asBoolean();
        
        result.put("sha", sha);
        result.put("truncated", truncated);
        result.put("repository", owner + "/" + repo);
        
        // Build tree structure
        TreeNode root = new TreeNode("", "tree", null, 0);
        
        if (treeArray != null && treeArray.isArray()) {
            for (JsonNode item : treeArray) {
                String path = item.get("path").asText();
                String type = item.get("type").asText();
                String itemSha = item.get("sha").asText();
                int size = item.has("size") ? item.get("size").asInt() : 0;
                
                addToTree(root, path, type, itemSha, size, owner, repo, baseUrl);
            }
        }
        
        result.put("tree", buildTreeMap(root));
        result.put("statistics", calculateStatistics(root));
        
        return result;
    }
    
    /**
     * Formats tree as a flat list with indentation for display
     */
    public List<Map<String, Object>> formatTreeAsList(JsonNode treeResponse, String owner, String repo, String baseUrl) {
        List<Map<String, Object>> result = new ArrayList<>();
        JsonNode treeArray = treeResponse.get("tree");
        
        if (treeArray != null && treeArray.isArray()) {
            for (JsonNode item : treeArray) {
                Map<String, Object> entry = new HashMap<>();
                String path = item.get("path").asText();
                String type = item.get("type").asText();
                String itemSha = item.get("sha").asText();
                
                entry.put("path", path);
                entry.put("type", type);
                entry.put("sha", itemSha);
                entry.put("depth", countSlashes(path));
                entry.put("name", getFileName(path));
                entry.put("parentPath", getParentPath(path));
                
                if (type.equals("blob")) {
                    int size = item.has("size") ? item.get("size").asInt() : 0;
                    entry.put("size", size);
                    entry.put("sizeFormatted", formatSize(size));
                    entry.put("url", buildCustomUrl(baseUrl, owner, repo, path));
                }
                
                result.add(entry);
            }
        }
        
        return result;
    }
    
    /**
     * Groups files by directory
     */
    public Map<String, Object> formatTreeByDirectory(JsonNode treeResponse, String owner, String repo, String baseUrl) {
        Map<String, Object> result = new HashMap<>();
        Map<String, List<Map<String, Object>>> directories = new LinkedHashMap<>();
        
        JsonNode treeArray = treeResponse.get("tree");
        
        if (treeArray != null && treeArray.isArray()) {
            for (JsonNode item : treeArray) {
                String path = item.get("path").asText();
                String type = item.get("type").asText();
                String itemSha = item.get("sha").asText();
                
                String directory = getParentPath(path);
                if (directory.isEmpty()) {
                    directory = "/";
                }
                
                directories.putIfAbsent(directory, new ArrayList<>());
                
                Map<String, Object> entry = new HashMap<>();
                entry.put("name", getFileName(path));
                entry.put("path", path);
                entry.put("type", type);
                entry.put("sha", itemSha);
                
                if (type.equals("blob")) {
                    int size = item.has("size") ? item.get("size").asInt() : 0;
                    entry.put("size", size);
                    entry.put("sizeFormatted", formatSize(size));
                    entry.put("url", buildCustomUrl(baseUrl, owner, repo, path));
                }
                
                directories.get(directory).add(entry);
            }
        }
        
        result.put("repository", owner + "/" + repo);
        result.put("directories", directories);
        result.put("directoryCount", directories.size());
        
        return result;
    }

    /**
     * Formats tree as a deeply nested structure showing full paths
     * with parent-child relationships recursively
     */
    public Map<String, Object> formatTreeAsNested(JsonNode treeResponse, String owner, String repo) {
        Map<String, Object> root = new LinkedHashMap<>();
        root.put("path", "/");
        root.put("type", "tree");

        JsonNode treeArray = treeResponse.get("tree");
        
        if (treeArray != null && treeArray.isArray()) {
            // Build a hierarchical map: path -> item data
            Map<String, Map<String, Object>> itemMap = new LinkedHashMap<>();
            Map<String, List<String>> childrenMap = new LinkedHashMap<>();

            // First pass: create all items and map children
            for (JsonNode item : treeArray) {
                String path = item.get("path").asText();
                String type = item.get("type").asText();
                String sha = item.get("sha").asText();
                int size = item.has("size") ? item.get("size").asInt() : 0;

                // Create item entry
                Map<String, Object> entry = new LinkedHashMap<>();
                entry.put("path", path);
                entry.put("type", type);
                entry.put("sha", sha);

                if (type.equals("blob")) {
                    entry.put("size", size);
                    entry.put("sizeFormatted", formatSize(size));
                    entry.put("url", buildCustomUrl("", owner, repo, path));
                }

                itemMap.put(path, entry);

                // Map parent-child relationships
                String parentPath = getParentPath(path);
                if (parentPath.isEmpty()) {
                    parentPath = "/";
                }
                childrenMap.putIfAbsent(parentPath, new ArrayList<>());
                childrenMap.get(parentPath).add(path);
            }

            // Second pass: build nested structure recursively
            List<Map<String, Object>> rootChildren = new ArrayList<>();
            for (String childPath : childrenMap.getOrDefault("/", new ArrayList<>())) {
                rootChildren.add(buildNestedNode(childPath, itemMap, childrenMap));
            }

            if (!rootChildren.isEmpty()) {
                root.put("children", rootChildren);
            }
        }

        return root;
    }

    /**
     * Recursively builds a nested node with all its children
     */
    private Map<String, Object> buildNestedNode(String path, Map<String, Map<String, Object>> itemMap, 
                                                Map<String, List<String>> childrenMap) {
        Map<String, Object> node = new LinkedHashMap<>(itemMap.get(path));
        
        // Get all children of this path
        List<String> childPaths = childrenMap.getOrDefault(path, new ArrayList<>());
        if (!childPaths.isEmpty()) {
            List<Map<String, Object>> children = new ArrayList<>();
            for (String childPath : childPaths) {
                children.add(buildNestedNode(childPath, itemMap, childrenMap));
            }
            node.put("children", children);
        }
        
        return node;
    }

    private void markNestedAsProcessed(Set<String> processed, List<Map<String, Object>> items) {
        for (Map<String, Object> item : items) {
            String path = (String) item.get("path");
            processed.add(path);

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> subChildren = (List<Map<String, Object>>) item.get("children");
            if (subChildren != null) {
                markNestedAsProcessed(processed, subChildren);
            }
        }
    }

    private void addToTree(TreeNode parent, String path, String type, String sha, int size,
                          String owner, String repo, String baseUrl) {
        String[] parts = path.split("/");
        TreeNode current = parent;
        
        for (int i = 0; i < parts.length; i++) {
            String part = parts[i];
            boolean isLast = (i == parts.length - 1);
            String nodeType = isLast ? type : "tree";
            
            TreeNode child = current.findChild(part);
            if (child == null) {
                child = new TreeNode(part, nodeType, sha, size);
                current.addChild(child);
            }
            
            if (isLast && type.equals("blob")) {
                child.url = buildCustomUrl(baseUrl, owner, repo, path);
                child.size = size;
                child.sizeFormatted = formatSize(size);
            }
            
            current = child;
        }
    }
    
    private Map<String, Object> buildTreeMap(TreeNode node) {
        Map<String, Object> map = new LinkedHashMap<>();
        
        if (!node.name.isEmpty()) {
            map.put("name", node.name);
            map.put("type", node.type);
            
            if (node.type.equals("blob")) {
                map.put("sha", node.sha);
                map.put("size", node.size);
                map.put("sizeFormatted", node.sizeFormatted);
                map.put("url", node.url);
            }
        }
        
        if (!node.children.isEmpty()) {
            List<Map<String, Object>> children = new ArrayList<>();
            for (TreeNode child : node.children) {
                children.add(buildTreeMap(child));
            }
            map.put("children", children);
        }
        
        return map;
    }
    
    private Map<String, Object> calculateStatistics(TreeNode root) {
        Map<String, Object> stats = new HashMap<>();
        int[] counts = new int[3]; // files, directories, totalSize
        
        countNodes(root, counts);
        
        stats.put("files", counts[0]);
        stats.put("directories", counts[1]);
        stats.put("totalSize", counts[2]);
        stats.put("totalSizeFormatted", formatSize(counts[2]));
        
        return stats;
    }
    
    private void countNodes(TreeNode node, int[] counts) {
        if (node.type.equals("blob")) {
            counts[0]++; // files
            counts[2] += node.size; // totalSize
        } else if (!node.name.isEmpty()) {
            counts[1]++; // directories
        }
        
        for (TreeNode child : node.children) {
            countNodes(child, counts);
        }
    }
    
    private String buildCustomUrl(String baseUrl, String owner, String repo, String path) {
        return String.format("%s/project-service/api/projects/github/content/%s/%s?filePath=%s",
            baseUrl, owner, repo, path);
    }
    
    private String getFileName(String path) {
        int lastSlash = path.lastIndexOf('/');
        return lastSlash >= 0 ? path.substring(lastSlash + 1) : path;
    }
    
    private String getParentPath(String path) {
        int lastSlash = path.lastIndexOf('/');
        return lastSlash > 0 ? path.substring(0, lastSlash) : "";
    }
    
    private int countSlashes(String path) {
        int count = 0;
        for (char c : path.toCharArray()) {
            if (c == '/') count++;
        }
        return count;
    }
    
    private String formatSize(int bytes) {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return String.format("%.2f KB", bytes / 1024.0);
        return String.format("%.2f MB", bytes / (1024.0 * 1024.0));
    }
    
    private static class TreeNode {
        String name;
        String type;
        String sha;
        int size;
        String sizeFormatted;
        String url;
        List<TreeNode> children = new ArrayList<>();
        
        TreeNode(String name, String type, String sha, int size) {
            this.name = name;
            this.type = type;
            this.sha = sha;
            this.size = size;
        }
        
        void addChild(TreeNode child) {
            children.add(child);
        }
        
        TreeNode findChild(String name) {
            for (TreeNode child : children) {
                if (child.name.equals(name)) {
                    return child;
                }
            }
            return null;
        }
    }
}

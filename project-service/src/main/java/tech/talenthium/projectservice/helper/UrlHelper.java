package tech.talenthium.projectservice.helper;

import java.net.URI;

public class UrlHelper {
    public static String normalizeUri(URI uri) {
        String host = uri.getHost().toLowerCase();

        // include port if explicitly defined
        int port = uri.getPort();
        String portPart = (port != -1) ? ":" + port : "";

        String path = uri.getPath();
        if (path != null && path.endsWith("/") && path.length() > 1) {
            path = path.substring(0, path.length() - 1);
        }

        return host + portPart + (path != null ? path : "");
    }
}

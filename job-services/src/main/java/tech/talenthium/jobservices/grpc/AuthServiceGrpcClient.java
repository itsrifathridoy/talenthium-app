//package tech.talenthium.jobservices.grpc;
//
//import com.netflix.appinfo.InstanceInfo;
//import com.netflix.discovery.EurekaClient;
//import io.grpc.ManagedChannel;
//import io.grpc.ManagedChannelBuilder;
//import org.springframework.stereotype.Service;
//import tech.talenthium.auth.AuthServiceGrpc;
//import tech.talenthium.auth.AuthServiceProto.*;
//
//
//
//
//@Service
//public class AuthServiceGrpcClient {
//    private final AuthServiceGrpc.AuthServiceBlockingStub blockingStub;
//
//    public AuthServiceGrpcClient(EurekaClient eurekaClient) {
//        InstanceInfo instance = eurekaClient.getNextServerFromEureka("AUTH-SERVICE", false);
//
//        String host = instance.getIPAddr();   // or instance.getHostName()
//        int grpcPort = Integer.parseInt(instance.getMetadata().get("grpc.port"));
//
//
//        ManagedChannel channel = ManagedChannelBuilder.forAddress(host, grpcPort)
//                .usePlaintext()
//                .build();
//
//        blockingStub = AuthServiceGrpc.newBlockingStub(channel);
//    }
//
//    public DeveloperResponse getDeveloperById(long developerId) {
//        GetDeveloperByIdRequest request = GetDeveloperByIdRequest.newBuilder()
//                .setDeveloperId(developerId)
//                .build();
//
//        return blockingStub.getDeveloperById(request);
//    }
//    public DeveloperResponse getDeveloperByUsername(String username){
//        GetDeveloperByUsernameRequest request = GetDeveloperByUsernameRequest.newBuilder()
//                .setUsername(username)
//                .build();
//        return blockingStub.getDeveloperByUsername(request);
//    }
//    public RecruiterResponse getRecruiterById(long recruiterId){
//        GetRecruiterByIdRequest request = GetRecruiterByIdRequest.newBuilder()
//                .setRecruiterId(recruiterId)
//                .build();
//        return blockingStub.getRecruiterById(request);
//    }
//    public RecruiterResponse getRecruiterByUsername(String username){
//        GetRecruiterByUsernameRequest request = GetRecruiterByUsernameRequest.newBuilder()
//                .setUsername(username)
//                .build();
//        return blockingStub.getRecruiterByUsername(request);
//    }
//}

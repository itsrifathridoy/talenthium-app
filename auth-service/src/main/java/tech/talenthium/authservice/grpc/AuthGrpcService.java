package tech.talenthium.authservice.grpc;

import com.google.protobuf.Timestamp;
import io.grpc.stub.StreamObserver;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;
import tech.talenthium.auth.AuthServiceGrpc;
import tech.talenthium.auth.AuthServiceProto.*;
import tech.talenthium.authservice.entity.Role;
import tech.talenthium.authservice.entity.User;
import tech.talenthium.authservice.exception.NotFoundException;
import tech.talenthium.authservice.service.UserService;

import java.time.ZoneOffset;

@Slf4j
@GrpcService
public class AuthGrpcService extends AuthServiceGrpc.AuthServiceImplBase {

    private final UserService userService;

    public AuthGrpcService(UserService userService) {
        this.userService = userService;
    }

    @Override
    public void getDeveloperById(GetDeveloperByIdRequest request, StreamObserver<DeveloperResponse> responseObserver) {
        try {
            User developer = userService.findByUserIDAndRole(request.getDeveloperId(), Role.ROLE_DEVELOPER)
                    .orElseThrow(() -> new NotFoundException("Developer not found"));

            Timestamp timestamp = Timestamp.newBuilder()
                    .setSeconds(developer.getDateOfBirth().atStartOfDay().toEpochSecond(ZoneOffset.UTC))
                    .build();

            DeveloperResponse response = DeveloperResponse.newBuilder()
                    .setDeveloperId(developer.getUserID())
                    .setUsername(developer.getUsername())
                    .setName(developer.getName())
                    .setEmail(developer.getEmail())
                    .setPhone(developer.getPhone())
                    .setDateOfBirth(timestamp)
                    .setAvatar(developer.getAvatar())
                    .setRole(developer.getRole().name())
                    .setIsActive(developer.isActive())
                    .build();

            responseObserver.onNext(response);
            responseObserver.onCompleted();

        } catch (NotFoundException ex) {
            responseObserver.onError(
                    io.grpc.Status.NOT_FOUND
                            .withDescription(ex.getMessage())
                            .asRuntimeException()
            );
        } catch (Exception ex) {
            responseObserver.onError(
                    io.grpc.Status.INTERNAL
                            .withDescription("Unexpected error: " + ex.getMessage())
                            .asRuntimeException()
            );
        }
    }


    @Override
    public void getDeveloperByUsername(GetDeveloperByUsernameRequest request, StreamObserver<DeveloperResponse> responseObserver) {
        DeveloperResponse response = DeveloperResponse.newBuilder()
                .setDeveloperId(1L)
                .setUsername("developer")
                .setEmail("dev@gmail.com")
                .build();

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    @Override
    public void getRecruiterById(GetRecruiterByIdRequest request, StreamObserver<RecruiterResponse> responseObserver) {
        RecruiterResponse response = RecruiterResponse.newBuilder()
                .setEmail("recruiter@gmail.com")
                .setName("Rifat")
                .build();
        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    @Override
    public void getRecruiterByUsername(GetRecruiterByUsernameRequest request, StreamObserver<RecruiterResponse> responseObserver) {
        RecruiterResponse response = RecruiterResponse.newBuilder()
                .setEmail("recruiter@gmail.com")
                .setName("Rifat")
                .build();
        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }
}

Automated Docker Image Security with Kaniko, Cosign, and Kyverno

Figure: Secure Docker Image Lifecycle Management
Diagram Flow
This image shows a workflow diagram for building, signing, and deploying a Docker container in a Kubernetes environment. Here's a summary of the key steps and components:
The process starts with a Dockerfile, used to build a Docker image using Kaniko.
The built Docker image is then signed using Cosign and a private key.
The signed image is verified using Kyverno, public key, and cluster policy.
After verification, a pod is created in Kubernetes.
The diagram also shows integration with CI/CD tools and container registries:
GitLab container registry is used in the process of the workflow
Key security components include:
Private and public keys for signing and verification
Cosign for image signing
Kyverno for policy enforcement and signature verification
This workflow represents a secure container deployment process, emphasizing image signing, verification, and policy enforcement before deployment to a Kubernetes cluster.
Kaniko
Build Docker Image 
Kaniko, developed by Google, is a popular tool in the software development world. Kaniko is designed to build container images from a Dockerfile, inside a container or Kubernetes cluster, without needing Docker daemon access. This makes creating images in environments like Kubernetes safer, especially when considering the security risks associated with Docker daemon’s privileged mode.

It can build accurate Docker images just like Docker would. 
It does this by executing each command in the Dockerfile in userspace, making a new layer in the filesystem for each command. 

So, using Kaniko in your Docker image-building workflow can make it more accurate, secure, and efficient. It’s also simple to include in your GitLab CI/CD pipeline. Now, let’s set up the build stage using Kaniko in GitLab CI.

Note: 
Understand the Difference:
Docker: 
Docker uses a daemon-based approach where the Docker daemon runs on the host machine and builds the image. This requires privileged access, which can be a security concern, especially in Kubernetes clusters. Docker Daemon is a persistent background process that manages Docker images, containers, networks, and storage volumes.
Kaniko: 
Kaniko is a tool to build container images from a Dockerfile, inside a container or Kubernetes cluster. It doesn’t require special privileges, making it more secure for Kubernetes environments.
Now, let’s set up the build stage using Kaniko in GitLab CI.
Required CI/CD variables for the workflow 




stages:
  - build-and-push

build-and-push:
  stage: build-and-push
  image:
    name: gcr.io/kaniko-project/executor:v1.14.0-debug
    entrypoint: [""]
  only:
    - main
  script:
    - echo "Authenticating to Docker Hub..."
    - AUTH=$(echo -n "$DOCKERHUB_USER:$DOCKERHUB_TOKEN" | base64)
    - echo "{\"auths\":{\"$(echo $DOCKERHUB_AUTH_URL | sed 's/"/\\"/g')\":{\"auth\":\"$(echo $AUTH | sed 's/"/\\"/g')\"}}}" > /kaniko/.docker/config.json
    - echo "Authentication file created. Contents (redacted):"
    - cat /kaniko/.docker/config.json | sed 's/"auth":"[^"]*"/"auth":"REDACTED"/g'
    - echo "Running Kaniko executor..."
    - /kaniko/executor 
      --build-arg IMAGE_NAME=$IMAGE_NAME
      --build-arg IMAGE_TAG=$IMAGE_TAG
      --destination docker.io/$DOCKERHUB_REPO/${DOCKERHUB_IMAGE_NAME}-develop:${CI_COMMIT_TAG}
      --digest-file=/tmp/digest
      --verbosity debug
    - echo "IMAGE_REF=docker.io/$DOCKERHUB_REPO/${DOCKERHUB_IMAGE_NAME}-develop:${CI_COMMIT_TAG}" >> build.env
    - echo "IMAGE_DIGEST=$(cat /tmp/digest)" >> build.env
  artifacts:
    reports:
      dotenv: build.env
    paths:
      - build.env


Cosign

A concise summary of how Cosign can be used to sign and verify Docker images:
Cosign: Securing the Software Supply Chain
Key Features:
Open-source tool to sign, verify, and store containers in OCI registries
Part of the Sigstore project to improve software supply chain security
Confirms Docker image origin and integrity to ensure safe image use
Easily integrates into existing workflows with minimal changes
Useful for automating signing in CI/CD pipelines
Getting Started with Cosign:
Create a public/private key pair using the cosign generate-key-pair command
Store the keys securely in GitLab environment variables or a secrets manager
Use Cosign to sign Docker images before pushing them to a registry
Verify signed images before pulling and using them
Keyless Signing with Sigstore:
Cosign supports keyless signing via the Sigstore project
Eliminates the need to manage and rotate private signing keys
Cosign requests a short-lived key pair, records it in a transparency log, then discards it
The key is generated using an OIDC token from the CI/CD pipeline
Cosign provides a straightforward way to add cryptographic signing and verification to your Docker image workflow, improving the security of your software supply chain.

Now, with the keys created and stored safely, we can set up a GitLab CI job to use Cosign for image signing.


stages:
  - sign

sign:
  stage: sign
  image: docker:latest
  needs:
    - build-and-push
  services:
    - docker:dind
  variables:
    COSIGN_YES: "true"
  id_tokens:
    SIGSTORE_ID_TOKEN:
      aud: sigstore
  script:
    - apk add --no-cache cosign
    - echo "Logging in to Docker Hub..."
    - echo "$DOCKERHUB_TOKEN" | docker login -u "$DOCKERHUB_USER" --password-stdin "$DOCKERHUB_AUTH_URL"
    - echo "Signing the image..."
    - IMAGE_REF=$(grep IMAGE_REF build.env | cut -d'=' -f2)
    - IMAGE_DIGEST=$(grep IMAGE_DIGEST build.env | cut -d'=' -f2)
    - cosign sign "${IMAGE_REF}@${IMAGE_DIGEzST}"
    - echo "Image signed successfully"
    - docker logout "$DOCKERHUB_AUTH_URL"
    - echo "Verifying the signed image..."
    - cosign verify "${IMAGE_REF}@${IMAGE_DIGEST}" --certificate-identity "$CI_PROJECT_URL//.gitlab-ci.yml@refs/heads/$CI_COMMIT_BRANCH" --certificate-oidc-issuer "$CI_SERVER_URL"
    - echo "Image verified successfully"
  artifacts:
    paths:
      - build.env


Container Signing + Admission controller
This repository shows an example of how to use GitLab CI to sign container images with cosign. When new commits are pushed to the main, this project will build a new container image and sign it using cosign.
The Kubernetes admission controller can then be used to prevent unsigned images from running in your Kubernetes cluster.
To set up the admission controller for this purpose:

policy.yaml
apiVersion: policy.sigstore.dev/v1beta1
kind: ClusterImagePolicy
metadata:
  name: image-policy
spec:
  images:
    - glob: "**"
  authorities:
    - keyless:
        url: "https://fulcio.sigstore.dev"
        identities:
          - issuer: https://gitlab.com
            subject: https://gitlab.com/bwill/container-signing//.gitlab-ci.yml@refs/heads/main


Image Verification using cosign 
IMAGE_REF="index.docker.io/rajivgs/node-develop"
IMAGE_DIGEST="sha256:b3c2acbad551a2793c0d97073c654a560fb272c8e5310f31c27ea35b4c246f7b"
CI_PROJECT_URL="https://gitlab.com/RajivGS/KCK"
CI_COMMIT_BRANCH="main"
CI_SERVER_URL="https://gitlab.com"

cosign verify "${IMAGE_REF}@${IMAGE_DIGEST}" \
  --certificate-identity "$CI_PROJECT_URL//.gitlab-ci.yml@refs/heads/$CI_COMMIT_BRANCH" \
  --certificate-oidc-issuer "$CI_SERVER_URL"




Note:
Signing Image with Sigstore:
Before signing any image, we need to publish the image to a registry. Cosign does not support the signing of images that have not been published to a registry. On top of that, you need to have write permission to that registry.






As you can see, essentially, the signature is stored within the same image registry as the main image. The signature carries the identical image digest, with the addition of “.sig” appended to it. Very easy to remember!
Up to this moment, we uploaded the image and the image signature. What’s next? Now let’s verify it in Kubernetes using Kyverno!


Kyverno
Install Kyverno using Helm:
Kyverno can be deployed via a Helm chart–the recommended and preferred method for a production install–which is accessible either through the Kyverno repository or on Artifact Hub. Both generally available and pre-releases are available with Helm.
Full documentation at: https://kyverno.io
Note: Require kubeVersion >=1.25 for kyverno 
To install Kyverno with Helm, first add the Kyverno Helm repository.

helm repo add kyverno https://kyverno.github.io/kyverno/
helm install kyverno --namespace kyverno kyverno/kyverno --create-namespace



To secure our Kubernetes clusters, it is essential to ensure that only trusted, signed container images are deployed. Kyverno is a policy engine for Kubernetes that can be used to enforce this security policy.

To use Kyverno to verify container image signatures, we can define a ClusterPolicy CR that specifies the container images to be verified and the required digests. This policy will prevent unauthorized images from being deployed to the cluster.


Here are the steps involved:

Define the specific container image to be verified, either by its tag or SHA.
Create a Kyverno ClusterPolicy CR that specifies the container image to be verified and the required digest.
Apply the ClusterPolicy CR to the Kubernetes cluster.
Once the ClusterPolicy CR is applied, Kyverno will intercept all requests to create new pods and deployments. If the container image specified in the request does not have a valid signature or does not match the required digest, Kyverno will deny the request.


ClusterPolicy 

apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: verify-node-develop-image-signature
spec:
 #Specifies that if the image signature verification fails, the Pod will be rejected.
  validationFailureAction: Enforce
#Indicates that the policy will be applied during admission control,
  background: false 
  rules:
#Specifies that this rule applies to Pods.
    - name: verify-image-signature   
    match:
        resources:
          kinds:
            - Pod
      verifyImages:
      - image: "index.docker.io/rajivgs/node-develop:*"
#Enables verification of the image digest (SHA256 hash).
        verifyDigest: true 
#Enables mutating the Pod specification to include the verified image digest.
        mutateDigest: true         
 # verifying the image signature.
attestors: 
        - entries:
#Specifies a keyless attestor.
          - keyless: 
 #Specifies the subject of the attestation, which is the GitLab CI/CD pipeline configuration file at the main branch.
              subject: 
"https://gitlab.com/RajivGS/KCK//.gitlab-ci.yml@refs/heads/main"              		issuer: "https://gitlab.com"
#Rekor transparency log server that is used to verify the attestation of the Docker image signature. 
              rekor:
                url: "https://rekor.sigstore.dev"

Note: 
When applying the Kyverno ClusterPolicy manifest "verify-node-develop-image-signature" to a Kubernetes cluster, it will be enforced on any Pod that uses the "rajivgs/node-develop" Docker image, regardless of whether the image is specified directly in the Pod manifest or in a higher-level resource like a Deployment.






Create a manifest and use the unsigned docker image 

apiVersion: v1
kind: Pod
metadata:
  name: node-develop-fail
spec:
  containers:
  - name: node-develop
    image: index.docker.io/rajivgs/node-develop:unsigned



Now, we deploy the  clusterpolicy, docker signed  image, and unsigned image we can set up a GitLab CI job to use

deploy:
  stage: deploy
  image: 
    name: bitnami/kubectl:latest
    entrypoint: [""]
  needs:
    - sign
  before_script:
    - echo "Kubernetes config file path $KUBECONFIG"
    - export KUBECONFIG=$KUBECONFIG   
    - kubectl config view
  script:
    - echo "Deploying signed image to Kubernetes cluster..."
    - IMAGE_REF=$(grep IMAGE_REF build.env | cut -d'=' -f2)
    - IMAGE_DIGEST=$(grep IMAGE_DIGEST build.env | cut -d'=' -f2)
    - FULL_IMAGE_REF="${IMAGE_REF}@${IMAGE_DIGEST}"
    # Create Kyverno ClusterPolicy manifest
    - |
      cat << EOF > kyverno-policy.yaml
      apiVersion: kyverno.io/v1
      kind: ClusterPolicy
      metadata:
        name: verify-node-develop-image-signature
      spec:
        validationFailureAction: Enforce
        background: false
        rules:
          - name: verify-image-signature
            match:
              resources:
                kinds:
                  - Pod
            verifyImages:
            - image: "index.docker.io/rajivgs/node-develop:*"
              verifyDigest: true
              mutateDigest: true
              attestors:
              - entries:
                - keyless:
                    subject: "https://gitlab.com/RajivGS/KCK//.gitlab-ci.yml@refs/heads/main"
                    issuer: "https://gitlab.com"
                    rekor:
                      url: "https://rekor.sigstore.dev"
      EOF
    # Apply Kyverno ClusterPolicy
    - echo "Applying Kyverno ClusterPolicy..."
    - kubectl apply -f kyverno-policy.yaml
    # Create a temporary deployment YAML
    - |
      cat << EOF > deployment.yaml
      apiVersion: apps/v1
      kind: Deployment
      metadata:
        name: ${DOCKERHUB_IMAGE_NAME}-deployment
      spec:
        replicas: 1
        selector:
          matchLabels:
            app: ${DOCKERHUB_IMAGE_NAME}
        template:
          metadata:
            labels:
              app: ${DOCKERHUB_IMAGE_NAME}
          spec:
            containers:
            - name: ${DOCKERHUB_IMAGE_NAME}
              image: ${FULL_IMAGE_REF}
              imagePullPolicy: Always
      EOF
    # Apply the deployment
    - kubectl apply -f deployment.yaml  --validate=false
    # Create a manifest file for reference
    - |
      cat << EOF > manifest.yaml
      apiVersion: apps/v1
      kind: Deployment
      metadata:
        name: ${DOCKERHUB_IMAGE_NAME}-deployment
      spec:
        template:
          spec:
            containers:
            - name: ${DOCKERHUB_IMAGE_NAME}
              image: ${FULL_IMAGE_REF}
      EOF
    # Create unsigned image deployment
    - |
      cat << EOF > unsigned-deployment.yaml
      apiVersion: v1
      kind: Pod
      metadata:
        name: node-develop-fail
      spec:
        containers:
        - name: node-develop
          image: index.docker.io/rajivgs/node-develop:unsigned
      EOF
    # Attempt to apply unsigned image deployment (expected to fail)
    - echo "Attempting to apply unsigned deployment (expected to fail)..."
    - kubectl apply -f unsigned-deployment.yaml --validate=false || true
    - echo "Deployments created and applied"
    - echo "Deployment created and manifest generated"
  artifacts:
    paths:
      - deployment.yaml
      - manifest.yaml
      - unsigned-deployment.yaml




Reference:
Url:
https://github.com/GoogleContainerTools/kaniko
https://www.youtube.com/watch?v=EgwVQN6GNJg&t=976s
https://docs.sigstore.dev/signing/quickstart/
https://docs.gitlab.com/ee/ci/
https://gitlab.com/bwill/container-signing/-/tree/aeb9ba494f2b5fb761c91ca53a221295eaf79ef3
https://kyverno.io/
https://github.com/vfarcic/kaniko-demo
https://medium.com/@glen.yu/why-i-prefer-kyverno-over-gatekeeper-for-native-kubernetes-policy-management-35a05bb94964




Queries:
Why using Kaniko instead of the Docker 

Figure: Kaniko 

Figure: Docker 

When getting started, you’re likely to run into an error like this:
Cannot connect to the Docker daemon at unix:///var/run/docker.sock. Is the docker daemon running?

securityContext:
  privileged: true
  allowPrivilegeEscalation: true

 Caching is challenging in Docker, as changes to any layer will invalidate the entire cache for that layer and subsequent layers. Kaniko provides an efficient cache management system where only the necessary layers are invalidated, leading to better cache utilization and faster builds.
Comparison between Docker and Kaniko

Aspect
Docker
Kaniko
Build Process
Monolithic, performed inside Docker daemon
Distributed, each step executed in separate container
Privileged Access
Requires privileged access to Docker daemon
Doesn't require privileged access
Build Context
Entire project directory sent to Docker daemon
Users can define specific files/directories
Rebuild Trigger
Changes in project directory trigger complete rebuild
Only rebuilds necessary parts that have changed
Build Performance
Can be slower due to intermediate containers and layers
Faster due to incremental build process
Build Environment
Tightly coupled to host machine
More isolated and reproducible
Compatibility
May encounter issues when moving between environments
Consistent builds across different platforms
Cache Management
Maintains cache of intermediate layers
More efficient cache management system
Cache Invalidation
Changes invalidate cache for that layer and subsequent ones
Only necessary layers are invalidated
Security
Potential risks due to privileged daemon access
Additional security from isolated build steps
Attack Surface
Larger due to daemon access requirement
Reduced, eliminating need for privileged access



Cosign alternatives and similar packages
Spire. 8.3 9.7 Cosign VS Spire. The SPIFFE Runtime Environment.
in-toto. 5.1 8.3 Cosign VS in-toto. A Go implementation of in-toto. ...
Spiffe-Vault. 3.6 8.3 Cosign VS Spiffe-Vault. Integrates Spiffe and Vault to have secretless authentication.


How does Kaniko enhance security in the build environment?
Kaniko eliminates the need for a Docker daemon, reducing potential security risks in the build environment by executing each command in userspace, creating a new filesystem layer for each command.

What is the primary function of Cosign in this pipeline?
Cosign helps ensure the integrity and provenance of Docker images by signing them, verifying their source, and preventing tampering. It integrates well with existing workflows and can be automated as part of a CI/CD pipeline.

How does Kyverno enforce image signing policies?
Kyverno is a Kubernetes policy management tool that helps enforce best practices within the cluster. It can verify image signatures, ensuring only properly signed images are used. Kyverno policies can be defined to verify image signatures and enforce the use of signed images.

What are the benefits of this automated pipeline?
The automated pipeline offers improved security, enhanced efficiency, and increased consistency. It ensures that only signed and verified images are deployed, reducing the risk of deploying tampered or unauthorized images.

How can you monitor the health and status of the automated processes?
You can monitor the health and status of the automated processes using tools that provide visibility and reporting on the security posture of your Docker images across the organization. This includes monitoring the build, sign, and verify stages to ensure they are running smoothly and efficiently.

How does this pipeline integrate with your existing DevOps toolchain and CI/CD workflows?
The pipeline integrates seamlessly with GitLab CI/CD pipelines, allowing for the automation of the build, sign, and verify process. This integration ensures that the pipeline is part of your broader DevOps workflow and can be managed and updated centrally.

Scalability and Performance
Kaniko can efficiently build Docker images within Kubernetes clusters, replicating the functionality of Docker in a secure and scalable manner.
Cosign integrates well with existing workflows and can be automated as part of a CI/CD pipeline, allowing it to handle the volume of image signings required.
Kyverno is a Kubernetes-native policy management tool that can scale with your infrastructure, enforcing image signing policies consistently across all environments

Reliability and Fault Tolerance
Implement robust error handling and retries in your pipeline scripts to ensure resilience to temporary failures.
Monitor the health and status of the automated processes using tools like Prometheus and Grafana, which can provide visibility into the performance and reliability of the pipeline.
Set up alerting mechanisms to quickly notify the team of any issues or failures, allowing for prompt investigation and resolution.
Consistency and Governance
Define your image signing policies as Kyverno ClusterPolicies, which can be consistently applied across all namespaces and clusters.
Use tools like Argo CD to manage and synchronize the Kyverno policies across your environments, ensuring they are up-to-date and compliant with your security standards.
Regularly review and update the policies to adapt to changing security requirements and best practices.
Integration and Visibility
Integrate the pipeline with your existing GitLab CI/CD workflows by defining multiple build stages using Kaniko, allowing for flexibility and customization.
Use tools like Grafana to gain comprehensive visibility into the security posture of your Docker images across the organization, including build, sign, and verify stages.
Generate reports on image vulnerabilities, policy violations, and signing status to maintain oversight and compliance.


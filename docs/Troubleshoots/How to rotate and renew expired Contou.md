# How to rotate and renew expired Contour secrets (contourcert and envoycert) 

  The purpose  is to provide a detailed guide on how to rotate and renew expired secrets (contourcert and envoycert) under projectcountour namespace. It includes a step-by-step workaround, prerequisites, and verification steps.

#### Symptoms:
* > Envoy (pods with name starting with "projectcontour-envoy-") pods under projectcontour namespace show restarts.

#### Example
    
    kubectl get pods -n proejctcontour

    NAMESPACE        NAME                                     READY  STATUS    RESTARTS  AGE  
    projectcontour   projectcontour-contour-c476b465b-b5bvn    1/1   Running    1        16h  
    projectcontour   projectcontour-contour-c476b465b-jkhsd    1/1   Running    1        16h                    
    projectcontour   projectcontour-envoy-wegsv                1/2   Running    161      16h          
    projectcontour   projectcontour-envoy-sd7xc                1/2   Running    161      16h      
    projectcontour   projectcontour-envoy-u9hac                1/2   Running    162      16h         


* >    The secrets (contourcert and envoycert) in projectcontour namespace are expired.

#### Example 

    kubectl  get secret -n projectcontour envoycert -o jsonpath='{.data.ca\.crt}' | base64 -d | openssl x509 -noout -dates
    notBefore=Jul 24 19:11:31 2023 GMT
    notAfter=Jul 26 19:11:31 2024 GMT

    kubectl  get secret -n projectcontour contourcert -o jsonpath='{.data.ca\.crt}' | base64 -d | openssl x509 -noout -dates
    notBefore=Jul 24 19:11:31 2023 GMT
    notAfter=Jul 26 19:11:31 2024 GMT

* > The log for envoy pods in the projectcontour namespace (pods with name starting with "projectcontour-envoy-") reports TLS errors, such as:
```
  kubectl  logs -n projectcontour <envoy pod name>
```
* >  [2024-07-26 16:32:01.575][1][warning][config] [bazel-out/k8-opt/bin/source/common/config/_virtual_includes/grpc_stream_lib/common/config/grpc_stream.h:101] StreamListeners gRPC config stream closed: 14, upstream connect error or disconnect/reset before headers. reset reason: connection failure, transport failure reason: TLS error: 268435581:SSL routines:OPENSSL_internal:CERTIFICATE_VERIFY_FAILED


#### Cause
* > The secrets (contourcert and envoycert) are used for internal gRPC communication between Contour and Envoy.

#### Update the contour <version> and <image_version> under all the resources defined in "contour_certgen_job.yaml" which has following tags:

    "helm.sh/chart: contour-<version>"
    "image: docker.io/bitnami/contour:<image_version>"
    You can get the current version by running "kubectl describe" on contour deployment/pods.


Run the following commands from manager node to rotate/renew the expired contourcert/envoycert (you can run these commands on the control plane node, there is no need to pass kubeconfig option in that case):


    1. Take backup:
        kubectl get secret -n projectcontour contourcert -o yaml > contourcert-backup.yaml
      kubectl get secret -n projectcontour envoycert -o yaml > envoycert-backup.yaml

    2. Delete current contourcert and envoycert:
       kubectl delete secret -n projectcontour envoycert contourcert

    3. Generate new contourcert and envoycert :
        kubectl apply -f <path>/contour_certgen_job.yaml -n projectcontour

    4. Verify that the new contourcert/envoycert was generated:
        kubectl get secret -n projectcontour

    5. Verify that the validity period of new secrets is 10 years:
      kubectl get secret -n projectcontour envoycert -o jsonpath='{.data.ca\.crt}' | base64 -d | openssl x509 -noout -dates
      kubectl get secret -n projectcontour contourcert -o jsonpath='{.data.ca\.crt}' | base64 -d | openssl x509 -noout -dates

    6. Restart all contour pods:
       kubectl patch deployment projectcontour-contour -n projectcontour -p '{"spec": {"template": {"metadata": {"labels":{"test": "restart"} } } } }' --type=merge    

    7. Restart all envoy pods:
      kubectl patch daemonset projectcontour-envoy -n projectcontour -p '{"spec": {"template": {"metadata": {"labels":{"test": "restart"} } } } }' --type=merge

    8. Delete projectcontour-contour-certgen job if it is present:
      kubectl get job projectcontour-contour-certgen -n projectcontour 

        If the output of above command shows the projectcontour-contour-certgen job, then run below command to delete it: 
      kubectl delete job projectcontour-contour-certgen -n projectcontour

    9. Verify all contour/envoy pods are in running state and not restarting:
      kubectl get pods -n projectcontour


#### Manifest 
```
apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  annotations:
    seccomp.security.alpha.kubernetes.io/allowedProfileNames: '*'
    "helm.sh/hook": "pre-install,pre-upgrade"
    "helm.sh/hook-delete-policy": before-hook-creation,hook-succeeded
  labels:
    app.kubernetes.io/name: contour
    helm.sh/chart: contour-10.2.2
    app.kubernetes.io/instance: projectcontour
    app.kubernetes.io/managed-by: Helm
    app.kubernetes.io/component: contour-certgen
  name: projectcontour-contour-certgen-psp
  namespace: zerone-projectcontour
spec:
  allowPrivilegeEscalation: true
  allowedCapabilities:
  - '*'
  fsGroup:
    rule: RunAsAny
  hostIPC: true
  hostNetwork: true
  hostPID: true
  hostPorts:
  - max: 65535
    min: 0
  privileged: true
  runAsUser:
    rule: RunAsAny
  seLinux:
    rule: RunAsAny
  supplementalGroups:
    rule: RunAsAny
  volumes:
  - '*'
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: projectcontour-contour-certgen
  namespace: zerone-projectcontour
  annotations:
    "helm.sh/hook": "pre-install,pre-upgrade"
    "helm.sh/hook-delete-policy": before-hook-creation,hook-succeeded
  labels:
    app.kubernetes.io/name: contour
    helm.sh/chart: contour-10.2.2
    app.kubernetes.io/instance: projectcontour
    app.kubernetes.io/managed-by: Helm
    app.kubernetes.io/component: contour-certgen
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: projectcontour-contour-certgen-psp
  namespace: zerone-projectcontour
  annotations:
    "helm.sh/hook": "pre-install,pre-upgrade"
    "helm.sh/hook-delete-policy": before-hook-creation,hook-succeeded
  labels:
    app.kubernetes.io/name: contour
    helm.sh/chart: contour-10.2.2
    app.kubernetes.io/instance: projectcontour
    app.kubernetes.io/managed-by: Helm
    app.kubernetes.io/component: contour-certgen
rules:
- apiGroups:
  - policy
  resourceNames:
  - projectcontour-contour-certgen-psp
  resources:
  - podsecuritypolicies
  verbs:
  - use
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: projectcontour-contour-certgen-psp
  namespace: zerone-projectcontour
  annotations:
    "helm.sh/hook": "pre-install,pre-upgrade"
    "helm.sh/hook-delete-policy": before-hook-creation,hook-succeeded
  labels:
    app.kubernetes.io/name: contour
    helm.sh/chart: contour-10.2.2
    app.kubernetes.io/instance: projectcontour
    app.kubernetes.io/managed-by: Helm
    app.kubernetes.io/component: contour-certgen
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: projectcontour-contour-certgen-psp
subjects:
  - kind: ServiceAccount
    name: projectcontour-contour-certgen
    namespace: zerone-projectcontour
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: projectcontour-contour-certgen
  namespace: zerone-projectcontour
  annotations:
    "helm.sh/hook": "pre-install,pre-upgrade"
    "helm.sh/hook-delete-policy": before-hook-creation,hook-succeeded
  labels:
    app.kubernetes.io/name: contour
    helm.sh/chart: contour-10.2.2
    app.kubernetes.io/instance: projectcontour
    app.kubernetes.io/managed-by: Helm
    app.kubernetes.io/component: contour-certgen
rules:
  - apiGroups:
      - ""
    resources:
      - secrets
    verbs:
      - create
      - update
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: projectcontour-contour-certgen
  namespace: zerone-projectcontour
  annotations:
    "helm.sh/hook": "pre-install,pre-upgrade"
    "helm.sh/hook-delete-policy": before-hook-creation,hook-succeeded
  labels:
    app.kubernetes.io/name: contour
    helm.sh/chart: contour-10.2.2
    app.kubernetes.io/instance: projectcontour
    app.kubernetes.io/managed-by: Helm
    app.kubernetes.io/component: contour-certgen
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: projectcontour-contour-certgen
subjects:
  - kind: ServiceAccount
    name: projectcontour-contour-certgen
---
apiVersion: batch/v1
kind: Job
metadata:
  name: projectcontour-contour-certgen
  namespace: zerone-projectcontour
  annotations:
    "helm.sh/hook": "pre-install,pre-upgrade"
    "helm.sh/hook-weight": "1"
    "helm.sh/hook-delete-policy": before-hook-creation,hook-succeeded
  labels:
    app.kubernetes.io/name: contour
    helm.sh/chart: contour-10.2.2
    app.kubernetes.io/instance: projectcontour
    app.kubernetes.io/managed-by: Helm
    app.kubernetes.io/component: contour-certgen
spec:
  ttlSecondsAfterFinished: 0
  template:
    metadata:
      labels:
        app.kubernetes.io/name: contour
        helm.sh/chart: contour-10.2.2
        app.kubernetes.io/instance: projectcontour
        app.kubernetes.io/managed-by: Helm
        app.kubernetes.io/component: contour-certgen
    spec:

      containers:
        - name: contour
          image: docker.io/bitnami/contour:1.23.3-debian-11-r0
          imagePullPolicy: IfNotPresent
          command:
            - contour
          args:
            - certgen
            - --kube
            - --incluster
            - --overwrite
            - --secrets-format=compact
            - --namespace=$(CONTOUR_NAMESPACE)
            - --certificate-lifetime=3650
          env:
            - name: CONTOUR_NAMESPACE
              valueFrom:
                fieldRef:
                  fieldPath: metadata.namespace
          resources:
            limits:
              memory: 256Mi
            requests:
              cpu: 40m
              memory: 32Mi
      restartPolicy: Never
      serviceAccountName: projectcontour-contour-certgen
      securityContext:
        runAsUser: 1001
        runAsGroup: 1001
        fsGroup:
        runAsNonRoot: true
  parallelism: 1
  completions: 1
  backoffLimit: 1
```

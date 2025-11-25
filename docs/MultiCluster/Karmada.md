# Prerequisites
### mkcert
  Installation: 
     https://github.com/FiloSottile/mkcert
```    
  mkcert clustermanager.local "*.clustermanager.local"
  # Create TLS secret from generated certificates
  kubectl create secret tls tls-secret \
      --cert=clustermanager.com+1.pem \
      --key=clustermanager.com+1-key.pem \
      -n default --dry-run=client -o yaml | kubectl apply -f -
```
###  MetalLB  (Local development) 
  ```
    echo "Installing metalLB"
    kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.13.5/config/manifests/metallb-native.yaml
    sleep 5
    while true
    do
        ready=`kubectl get pod -n metallb-system -l component=controller | grep controller | awk '{print $2}'`
        if [ "$ready" == "1/1" ]
        then
            break
        fi
        echo "Metallb status :: $ready, sleeping for 10 seconds..."
        sleep 10
        done
    network=$(docker network inspect -f '{{.IPAM.Config}}' kind | awk '{print $1}' | cut -f 1,2 -d '.' | cut -f 1 -d '{' --complement)
    if [ -z "$network" ]
    then
        network="172.18"
    fi
    printf "apiVersion: metallb.io/v1beta1\nkind: IPAddressPool\nmetadata:\n  name: example\n  namespace: metallb-system\nspec:\n  addresses:\n  - $network.254.200-$network.254.250\n---\napiVersion: metallb.io/v1beta1\nkind: L2Advertisement\nmetadata:\n  name: empty\n  namespace: metallb-system" | kubectl apply -f -
    sleep 10
  ```
### Ingress-Nginx

    helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
    helm install ingress-nginx ingress-nginx/ingress-nginx -n ingress-nginx --create-namespace --version 4.12.1

###  Certificate Manager

> Before installing the chart, you must first install the cert-manager CustomResourceDefinition resources. This is performed in a separate step to allow you to easily uninstall and reinstall cert-manager without deleting your installed custom resources.

    kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.17.1/cert-manager.crds.yaml

    helm repo add cert-manager https://charts.jetstack.io
    helm install cert-manager cert-manager/cert-manager -n cert-manager --create-namespace --version 1.17.1

# Install Karmada Control Plane
**Github :** https://github.com/karmada-io/karmada

```
helm repo add karmada-charts https://raw.githubusercontent.com/karmada-io/karmada/master/charts
helm install karmada -n karmada-system --create-namespace --dependency-update ./charts/karmada
```
- values.yaml
```
certs:
  ## @param certs.mode "auto" and "custom" are provided
  ## "auto" means auto generate certificate
  ## "custom" means use user certificate
  mode: auto
  auto:
    ## @param certs.auto.expiry expiry of the certificate
    expiry: 43800h
    ## @param certs.auto.hosts hosts of the certificate
    hosts: [
      "kubernetes.default.svc",
      "*.etcd.{{ .Release.Namespace }}.svc.{{ .Values.clusterDomain }}",
      "*.{{ .Release.Namespace }}.svc.{{ .Values.clusterDomain }}",
      "*.{{ .Release.Namespace }}.svc",
      "localhost",
      "*.clustermanager.com",
      "127.0.0.1"
    ]
```
- Need to provide the host for the karmada-apiserver ingress to be publicly accessible.


     This will install Karmada core components like Karmada API server, scheduler, controller-manager, etc., in the karmada-system namespace.

#### Create the karmada-apiserver Ingress:
```
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  annotations:
    nginx.ingress.kubernetes.io/ssl-passthrough: "true"
  name: karmada
  namespace: karmada-system
spec:
  ingressClassName: nginx
  rules:
  - host: karmada.clustermanager.com
    http:
      paths:
      - backend:
          service:
            name: karmada-apiserver
            port:
              number: 5443
        path: /
        pathType: ImplementationSpecific
  tls:
  - hosts:
    - karmada.clustermanager.com
    secretName: tls-secret
```
- > Note (in case of any issues):
```
    nginx.ingress.kubernetes.io/upstream-vhost: karmada-apiserver.karmada-system.svc
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
    nginx.ingress.kubernetes.io/proxy-buffer-size: 8k
    nginx.ingress.kubernetes.io/proxy-buffers-number: "4"
    nginx.ingress.kubernetes.io/proxy-ssl-verify: "off"
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/secure-backends: "true"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
```

##### During the Karmada Helm chart deployment, a secret containing the karmada-apiserver kubeconfig is created. Extract this kubeconfig file, which is used to configure the karmada-apiserver context.

######   Extract the Base64 Encoded Kubeconfig:

-  There are several ways to achieve this:

-  **Using kubectl and yq (recommended if you have yq installed) :**
```
kubectl get secret karmada-kubeconfig -n karmada-system -o jsonpath='{.data.kubeconfig}' | base64 -d > karmada.config
```

**Explanation :**

- **kubectl get secret karmada-kubeconfig -n karmada-system -o jsonpath='{.data.kubeconfig}' :** This extracts the value of the kubeconfig key from the data field of the secret, which is the base64 encoded kubeconfig.
- **base64 -d :** This command decodes the base64 string.
- **karmada.config :** This redirects the decoded output to a file named karmada.config.


**Using kubectl and jq (if you have jq installed) :**

```
kubectl get secret karmada-kubeconfig -n karmada-system -o json | jq -r '.data.kubeconfig' | base64 -d > karmada.config
```

**Explanation :**

- **kubectl get secret karmada-kubeconfig -n karmada-system -o json :**  Retrieves the secret in JSON format. 
- **jq -r '.data.kubeconfig' :** Parses the JSON and extracts the kubeconfig value (raw, without - quotes).
- **base64 -d :** Decodes the base64 string.
- **karmada.config :** Redirects the decoded output to the karmada.config file.


 **Using kubectl, sed, and awk (more manual but works without extra tools) :**
```
kubectl get secret karmada-kubeconfig -n karmada-system -o yaml | sed -n '/kubeconfig:/,$p' | awk '{if(NR>1)print}' | tr -d ' ' | base64 -d > karmada.config
```

**Explanation :**

- **kubectl get secret karmada-kubeconfig -n karmada-system -o yaml :** Gets the secret in YAML format.
- **sed -n '/kubeconfig:/,$p' :** Extracts lines from kubeconfig: to the end of the file.
- **awk '{if(NR>1)print}' :** Skips the first line (which is kubeconfig:)
- **tr -d ' ':** Removes leading spaces.
- **base64 -d :** Decodes the base64 string.
- **karmada.config :** Saves the decoded content to karmada.config.

###### Verify the File (Optional):

- You can verify that the karmada.config file is a valid kubeconfig file by using the kubectl command with the --kubeconfig flag:
```
kubectl --kubeconfig=karmada.config config view
```

Important Notes:

- **base64 -d :** The base64 -d command might be slightly different depending on your operating system. On macOS, you might need to use base64 -D.
- **yq and jq :** These are powerful command-line tools for processing YAML and JSON data. If you don't have them, you can usually install them with your system's package manager (e.g., apt-get install yq jq, brew install yq jq).
- **Security**: Be mindful of where you store your karmada.config file, as it contains credentials to access your Karmada control plane.

Inside the karamada.config file, you can find the following information:
```
apiVersion: v1
clusters:
- cluster: 
    certificate-authority-data: xxx
  server:  https://karmada-apiserver.karmada-system.svc.cluster.local:5443
contexts:
- context:
    cluster: karmada-apiserver
    user: karmada-apiserver
  name: karmada-apiserver
current-context: karmada
kind: Config
preferences: {}
users:
- name: karmada-apiserver
  user: 
    client-certifiticate-date: xxx
    client-key-data: xxx
    name: karmada-apiserver

```

Here, we the need to use the endpoints in the kubeconfig file to access the Karmada API server.
  i.e "https://karmada.clustermanager.com" in place of "https://karmada-apiserver.karmada-system.svc.cluster.local:5443"

Verify karmada-apiserver after the server is updated:
  
    export KUBECONFIG=karmada.config
    kubectl config get-contexts 


# Install Karmada Agent

    helm install karmada karmada/karmada --namespace karmada-system --create-namespace -f values.yaml

- **values.yaml**

```
installMode: "agent"
agent:
  clusterName: "kind-whitelotus"   # Name of the member cluster
  clusterEndpoint: "https://127.0.0.1:46339" # Member cluster endpoint
  ## kubeconfig of the karmada-apiserver 
  kubeconfig:
    caCrt: |                      # Certificate Authority Data
      -----BEGIN CERTIFICATE-----
      xxx
      -----END CERTIFICATE-----
    crt: |                        # Client Certificate Data
      -----BEGIN CERTIFICATE-----
      xxx
      -----END CERTIFICATE-----
    key: |                        # Client Key Data
      -----BEGIN RSA PRIVATE KEY-----
      xxx
      -----END RSA PRIVATE KEY-----
    server: "https://karmada.clustermanager.com"

```

- This installs the Karmada agent on the Kind cluster, allowing it to receive workloads scheduled by Karmada. 

Verify in Karmada host cluster
```
export KUBECONFIG=karmada.config
kubectl config get-contexts 
kubectl get clusters
```
You should see "kind-whitelotus" listed as a member cluster with status "Ready".

-  Verify Karmada mode:Agent
```
export KUBECONFIG=whitelotus.config
kubectl get pods -n karmada-system  
```


Create the Propagation Policy
```
apiVersion: policy.karmada.io/v1alpha1
kind: PropagationPolicy
metadata:
  name: nginx-policy
spec:
  resourceSelectors:
  - apiVersion: apps/v1
    kind: Deployment
    name: nginx-deployment-23
  placement:
    clusterAffinity:
      clusterNames:
        - kind-member3
```

Create a workload in the whitelotus cluster

```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment-23
  namespace: default
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.14.2
        ports:
        - containerPort: 80
```      

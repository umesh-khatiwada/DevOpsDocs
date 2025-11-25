# Kasten K10 Installation on Kind

## Prerequisites
- kind v0.8.1 or higher
- Kubernetes v1.17 or higher
- VolumeSnapshot beta CRDs and the Snapshot Controller
- The CSI Hostpath Driver

        https://github.com/kubernetes-csi/csi-driver-host-path

## Installation Setup

Before proceeding, ensure you have the following prerequisites in place:
-   **Kind:** v0.8.1 or higher
-   **Kubernetes:** v1.17 or higher
-   **VolumeSnapshot CRDs and the Snapshot Controller:**  These components are essential for managing volume snapshots in Kubernetes.
-   **CSI Hostpath Driver:** A Container Storage Interface (CSI) driver that provisions storage directly from the host's filesystem. This is suitable for Kind clusters.
### 1. Install Kubernetes with Kind

- **Create a Kubernetes cluster using Kind. We'll use Kubernetes v1.25.8 in this example:**

#### Apply VolumeSnapShot CRDS

**Ref Link**

     https://github.com/kubernetes-csi/external-snapshotter/tree/master/client/config/crd

```
kubectl apply -f https://raw.githubusercontent.com/kubernetes-csi/external-snapshotter/master/client/config/crd/snapshot.storage.k8s.io_volumesnapshotclasses.yaml

kubectl apply -f https://raw.githubusercontent.com/kubernetes-csi/external-snapshotter/master/client/config/crd/snapshot.storage.k8s.io_volumesnapshotclasses.yaml

kubectl apply -f https://raw.githubusercontent.com/kubernetes-csi/external-snapshotter/master/client/config/crd/snapshot.storage.k8s.io_volumesnapshotcontents.yaml

kubectl apply -f https://raw.githubusercontent.com/kubernetes-csi/external-snapshotter/master/client/config/crd/snapshot.storage.k8s.io_volumesnapshotcontents.yaml

kubectl apply -f https://raw.githubusercontent.com/kubernetes-csi/external-snapshotter/master/client/config/crd/snapshot.storage.k8s.io_volumesnapshots.yaml

kubectl apply -f https://raw.githubusercontent.com/kubernetes-csi/external-snapshotter/master/client/config/crd/snapshot.storage.k8s.io_volumesnapshots.yaml

```

### Create Snapshot Controller
**Ref Link**
    
    https://github.com/kubernetes-csi/external-snapshotter/tree/master/deploy/kubernetes/snapshot-controller

```
kubectl apply -f https://raw.githubusercontent.com/kubernetes-csi/external-snapshotter/master/deploy/kubernetes/snapshot-controller/rbac-snapshot-controller.yaml

kubectl apply -f https://raw.githubusercontent.com/kubernetes-csi/external-snapshotter/master/deploy/kubernetes/snapshot-controller/rbac-snapshot-controller.yaml

kubectl apply -f https://raw.githubusercontent.com/kubernetes-csi/external-snapshotter/master/deploy/kubernetes/snapshot-controller/setup-snapshot-controller.yaml
```

### Install the CSI Hostpath Driver
```
git clone https://github.com/kubernetes-csi/csi-driver-host-path.git

cd csi-driver-host-path

./deploy/kubernetes-1.25/deploy.sh
```
After the install is complete, add the CSI Hostpath Driver StorageClass and make it the default

Apply the yaml file from the external-snapshotter/examples/kubernetes
### Configure CSI Hostpath Driver StorageClass
```
kubectl apply -f ./examples/csi-storageclass.yaml

kubectl patch storageclass standard \
	-p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"false"}}}'

kubectl patch storageclass csi-hostpath-sc \
    -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'
```

####  Installing K10
	helm repo add kasten https://charts.kasten.io/
#### Install the chart
	helm install my-k10 kasten/k10 --version 6.0.2  --namespace=kasten-io
#### Annotate the CSI Hostpath VolumeSnapshotClass for use with K10
    kubectl annotate volumesnapshotclass csi-hostpath-snapclass \
    k10.kasten.io/is-snapshot-class=true


## Validating the Install

    kubectl get pods --namespace kasten-io --watch

## Validate Dashboard Access
```
kubectl --namespace kasten-io port-forward service/gateway 8080:8000

The K10 dashboard will be available at http://127.0.0.1:8080/release-name/#/.

The K10 dashboard will be available at http://127.0.0.1:8080/k10/#/.
```

## Reference Documentation Link:

- https://docs.kasten.io/latest/install/other/kind.html

For a complete list of options for accessing the Kasten K10 dashboard through a LoadBalancer, Ingress or OpenShift Route you can use the instructions

- https://docs.kasten.io/latest/access/dashboard.html#dashboard

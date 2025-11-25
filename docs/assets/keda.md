KEDA
Introduction 
	KEDA is a single-purpose and lightweight component that can be added into any Kubernetes cluster.
How KEDA Work 
KEDA performs three key roles within Kubernetes:
Agent — KEDA activates and deactivates Kubernetes Deployments to scale to and from zero on no events. This is one of the primary roles of the keda-operator container that runs when you install KEDA.
Metrics — KEDA acts as a Kubernetes metrics server that exposes rich event data like queue length or stream lag to the Horizontal Pod Autoscaler to drive scale out. It is up to the Deployment to consume the events directly from the source. This preserves rich event integration and enables gestures like completing or abandoning queue messages to work out of the box. The metric serving is the primary role of the keda-operator-metrics-apiserver container that runs when you install KEDA.
Admission Webhooks - Automatically validate resource changes to prevent misconfiguration and enforce best practices by using an admission controller. As an example, it will prevent multiple ScaledObjects to target the same scale target.


Architecture 
 The diagram below shows how KEDA works in conjunction with the Kubernetes Horizontal Pod Autoscaler, external event sources, and Kubernetes’ etcd data store

Event sources and scalers
KEDA has a wide range of scalers that can both detect if a deployment should be activated or deactivated, and feed custom metrics for a specific event source. The following scalers are available:

Custom Resources (CRD)
When you install KEDA, it creates four custom resources:
scaledobjects.keda.sh
scaledjobs.keda.sh
triggerauthentications.keda.sh
clustertriggerauthentications.keda.sh
These custom resources enable you to map an event source (and the authentication to that event source) to a Deployment, StatefulSet, Custom Resource or Job for scaling.
ScaledObjects represent the desired mapping between an event source (e.g. Rabbit MQ) and the Kubernetes Deployment, StatefulSet or any Custom Resource that defines /scale subresource.
ScaledJobs represent the mapping between event source and Kubernetes Job.
ScaledObject/ScaledJob may also reference a TriggerAuthentication or ClusterTriggerAuthentication which contains the authentication configuration or secrets to monitor the event source.

Deploy KEDA
	Installation 

Deploying with Helm 
  helm repo add kedacore https://kedacore.github.io/charts
 helm install keda kedacore/keda -n keda --create-namespace 

Deploying with Operator Hub
curl -sL https://github.com/operator-framework/operator-lifecycle-manager/releases/download/v0.27.0/install.sh | bash -s v0.27.0

kubectl create -f https://operatorhub.io/install/keda.yaml

YAML declarations
# Including admission webhooks

kubectl apply --server-side -f https://github.com/kedacore/keda/releases/download/v2.13.1/keda-2.13.1.yaml

# Without admission webhooks

kubectl apply --server-side -f https://github.com/kedacore/keda/releases/download/v2.13.1/keda-2.13.1-core.yaml




Keda Concept

Scaling Deployments, StatefulSets & Custom Resources
Scaling Jobs
Authentication
External Scalers
Admission Webhooks
Troubleshooting

Scaling Deployments, StatefulSets & Custom Resources
Manifest 

apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
 name: scaledobj-wp-1
 namespace:     zerone-1-1
spec:
 scaleTargetRef:
   apiVersion:    apps/v1
   kind:          Deployment
   name:          zerone-metadata-1-wordpress
 pollingInterval:  30
 cooldownPeriod:   300
 idleReplicaCount: 0
 minReplicaCount:  1
 maxReplicaCount:  15
 fallback:
   failureThreshold: 3
   replicas: 6
 advanced:
   restoreToOriginalReplicaCount: false
   horizontalPodAutoscalerConfig:
     behavior:
       scaleDown:
         stabilizationWindowSeconds: 300
         policies:
         - type: Percent
           value: 55
           periodSeconds: 15
 triggers:
 - type: memory
   metricType: Utilization # Allowed types are 'Utilization' or 'AverageValue'
   metadata:
     value: "30"
     containerName: "wordpress"



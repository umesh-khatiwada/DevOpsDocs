# KubeScape 

Kubescape is an open source Kubernetes security platform for your IDE, CI/CD pipelines, and clusters. Kubescape includes risk analysis, security compliance, and misconfiguration scanning.

## Installing Kubescape
 
``` 
curl -s https://raw.githubusercontent.com/kubescape/kubescape/master/install.sh | /bin/bash 
```
![](./../assets/images/KubeScape/installation.png)

Run a scan
```
kubescape scan --enable-host-scan --verbose

‘kubescape scan’ : command to scan k8s clusters
‘--enable-host-scan’:  scan not just the Kubernetes cluster itself, but also the underlying hosts on which the cluster is running.
‘--verbose’: to provide additional information during the scan.
```

![](./../assets/images/KubeScape/scanning%20risk%20and%20vulerabilities.png)

			Figure: Scanning the k8s cluster for Security risk and Vulnerabilities

- > ***Get results!***

![](./../assets/images/KubeScape/list%20os%20secutoiy%20risk.png)

			Figure: List of Security risk and Vulnerabilities

## ArmoSec with KubeScape

-  > ***Naviagte to cloud.armosec.io/account***

![](./../assets/images/KubeScape/armo%20log%20in.png)

-  > ***Connect the K8s Cluster***

![](./../assets/images/KubeScape/armo-%20k8s-cluster-connect.png)


![](./../assets/images/KubeScape/armo-cluster-connection.png)

-  > ***Check the compliance***

![](./../assets/images/KubeScape/arko-compliance.png)

-  > ***Check Dashboard for k8s cluster***

![](./../assets/images/KubeScape/armo-dashboard.png)


## Architecture of Kubescape

The main components of the Kubescape architecture are:

- ***Scanner***:

	This is the core component of Kubescape. It scans the Kubernetes cluster and identifies potential security risks and vulnerabilities. It uses different techniques to analyze the Kubernetes configuration and resources, such as identifying misconfigured network policies, insecure container images, and non-compliant Kubernetes objects.

- ***Policies***: 

	Kubescape uses a set of predefined policies to evaluate the Kubernetes environment. These policies are customizable and can be modified to suit the specific security requirements of an organization. The policies are written in YAML and can be easily extended to include additional checks.

- ***Result***: 

	The results component of Kubescape provides a detailed report of the security risks and vulnerabilities identified during the scan. It categorizes the findings based on their severity and provides remediation steps for each issue.

- ***Web interface***: 

	Kubescape comes with a web interface that allows users to interact with the tool and view the scan results. The interface provides an easy-to-use dashboard that summarizes the scan findings and allows users to drill down into specific issues.

- ***API***:
	
	 Kubescape also exposes an API that can be used to integrate with other security tools and automate the scanning process. The API can be used to trigger scans, retrieve scan results, and perform other actions programmatically.


## Usage of Kubescape
- ***Security auditing***: 
	
	Kubescape can be used to audit the security of a Kubernetes environment by scanning for security risks and vulnerabilities. It can help security teams to identify potential security issues and take the necessary steps to remediate them.

-  ***Compliance testing***: 

	Kubescape can also be used to test Kubernetes clusters against compliance standards such as PCI-DSS, HIPAA, or SOC 2. It can help organizations to ensure that their Kubernetes environments are compliant with industry standards and regulations.

-  ***DevOps integration***: 

	Kubescape can be integrated into the DevOps pipeline to perform security checks automatically. This can help organizations to ensure that their Kubernetes deployments are secure and compliant before they are deployed.

- ***Continuous Monitoring***: 
	
	Kubescape can be used to continuously monitor the security of a Kubernetes environment by running scheduled scans. This can help organizations to detect and remediate security risks and vulnerabilities in a timely manner.




## Demonstration 

Installation:
 
``` 
curl -s https://raw.githubusercontent.com/kubescape/kubescape/master/install.sh | /bin/bash 
```
![](./../assets/images/KubeScape/installation.png)


```
kubescape scan  --enable-host-scan
```

![](./../assets/images/KubeScape/kubescape-scan-cli.png)
![](./../assets/images/KubeScape/list%20os%20secutoiy%20risk.png)

		Scan the whole cluster in the system


- > ***Create and Deploy any Kubernetes Deployment file in the cluster***

![](./../assets/images/KubeScape/nginx-development.png)

- > ***Scan the created deployment file***
```	 
kubescape scan filename
```

![](./../assets/images/KubeScape/niginx-deploy%20%20&&%20report%20.png)

		Scanning the deployment file with vulnerabilities

- > ***Solving the Resources Limit vulnerabilities***

![](./../assets/images/KubeScape/Screenshot%20from%202023-09-30%2023-42-03.png)


		Adding the limit and request resources inside the deployment yaml file  



- > ***Resources Limit Vulnerabilities problem solved***

![](./../assets/images/KubeScape/Screenshot%20from%202023-09-30%2023-41-30.png)

Figure: Resources Limit Vulnerabilities Solved


- > ***Uploading the severity in the json format***
```
kubescape scan nginx-deploy.yaml --format json --output op.json
```
![](./../assets/images/KubeScape/oyaml.png)

		Saved the op.json file

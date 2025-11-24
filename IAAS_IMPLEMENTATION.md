# ☁️ IaaS Implementation in FanOps

## Overview
While the core of FanOps M2 is Serverless (Lambda/DynamoDB), we use **Infrastructure as a Service (IaaS)** to provide a dedicated security operations environment.

---

## 🖥️ The IaaS Component: Security VM

We have defined an **AWS EC2 Instance** in `serverless.yml`:

```yaml
SecurityTestInstance:
  Type: AWS::EC2::Instance
  Properties:
    InstanceType: t3.micro
    ImageId: ami-0694d931cee176e7d # Ubuntu 22.04 LTS
    Tags:
      - Key: Name
        Value: can2025-secure-gates-dev-test-instance
```

### Why use IaaS here?
1.  **Persistent Environment**: Unlike Lambda (ephemeral), this VM runs 24/7.
2.  **Security Tools**: We can install tools like `Nmap`, `Wireshark`, or `OWASP ZAP` to test our API security.
3.  **Log Forwarding**: It can act as a gateway to forward logs to Azure Sentinel (using Azure Arc).
4.  **VPN/Bastion**: It can serve as a secure entry point to access private DynamoDB tables (if configured in VPC).

---

## 🛠️ How to Configure & Use

### 1. Deployment
The instance is deployed automatically with:
```bash
serverless deploy --stage dev
```

### 2. Accessing the VM (SSH)
To access the instance, you need an SSH Key Pair.
*Note: The current `serverless.yml` needs an update to attach a KeyPair.*

**Update `serverless.yml`:**
```yaml
SecurityTestInstance:
  Properties:
    KeyName: my-ec2-keypair # Create this in AWS Console first
    SecurityGroups:
      - !Ref SecurityGroup
```

### 3. Managing the VM (IaaS Operations)
Unlike Serverless, **YOU** are responsible for this VM:
- **Patching**: Run `sudo apt update && sudo apt upgrade` regularly.
- **Monitoring**: Check CPU/RAM usage.
- **Security**: Configure Security Groups (Firewall) to only allow SSH (Port 22) from your IP.

---

## 🔄 Connecting IaaS to Azure Sentinel

To make this a true hybrid cloud component:

1.  **SSH into the VM**.
2.  **Install Azure Connected Machine Agent**:
    ```bash
    wget https://aka.ms/azcmagent -O ~/install_linux_azcmagent.sh
    bash ~/install_linux_azcmagent.sh
    ```
3.  **Connect to Azure**:
    ```bash
    sudo azcmagent connect --resource-group FanOps-Security \
      --tenant-id <Your-Tenant-ID> \
      --location westeurope \
      --subscription-id <Your-Subscription-ID>
    ```

**Result**: Your AWS EC2 instance now appears in **Azure Portal** as a server, managed by Azure Arc! You can apply policies and collect logs directly into Sentinel.

# Uygulama Kurulum ve Konfigürasyon Rehberi

Bu rehber, uygulamanızı kurmak için gerekli adımları açıklamaktadır. İki farklı environment bulunmaktadır:

- **Test Environment**: Docker Compose kullanılarak çalıştırılacak.
- **Production Environment**: Kubernetes cluster üzerinde çalışacak.

## Gereksinimler

Kurulum öncesinde aşağıdaki yazılımlar bilgisayarınızda kurulu olmalıdır:

- **VirtualBox**
- **Vagrant**

## Adım 1: VirtualBox ve Vagrant Kurulumu

1. VirtualBox ve Vagrant'ın en son sürümünü bilgisayarınıza indirin ve kurun.

https://developer.hashicorp.com/vagrant/docs/installation

https://www.virtualbox.org/wiki/Downloads


## Adım 2: Vagrant ile Kubernetes Cluster kurulumu ve diğer detaylar
Kubernetes cluster'ımızı 
VagrantK8s klasörü içerisinden kuracağız.

### Vagrant Komutları
1. Cluster’ı oluşturmak için ilgili dizin içerisinde şu komutu çalıştırın:
```
vagrant up
```

2. Kubernetes Cluster’a erişmek için KUBECONFIG’i export edin:

```
cd VagrantK8s
cd configs
export KUBECONFIG=$(pwd)/config
```
Alternatif olarak, ``` vagrant ssh ``` komutuyla controlplane içerisine giriş yapabilirsiniz:

3. Gerekli repository’yi controlplane içerisine klonlayın:

```
git clone https://github.com/temizzo/BiLira.git
```


## Adım 3: Longhorn Kurulumu ve UI Erişimi

### 3.1: Longhorn Kurulumu

Aşağıdaki komut ile Longhorn’u Kubernetes cluster’ınıza yükleyin:
```
kubectl apply -f https://raw.githubusercontent.com/longhorn/longhorn/master/deploy/longhorn.yaml
```

### 3.2: Longhorn UI'ya Erişim
Longhorn UI'ya erişim için iki worker node'da aşağıdaki adımları uygulayın:

VirtualBox üzerinden aşağıdaki adımları takip edin:

- Settings > Network > Adapter 1 > Advanced > Port Forwarding
- Yeni bir kural ekleyin:
   - Protocol: TCP
   - Host Port: 30005
   - Guest Port: 30005

Tarayıcınızdan http://localhost:30005 adresine giderek Longhorn UI'ya erişebilirsiniz.

## Adım 4: Kafka ve Zookeeper Kurulumu


### 4.1: Kafka Namespace Oluşturma

Kafka için namespace oluşturun:
```
kubectl create namespace kafka
```
### 4.2: Zookeeper Persistent Volume Claim
Zookeeper için PVC’yi oluşturmak adına aşağıdaki komutu çalıştırın:

```
kubectl apply -f Infrastructure/KafkaStack/zookeper-pvc.yaml
```

### 4.3: Zookeeper Helm Kurulumu

Zookeeper'ı Helm ile kurun:
```
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo list
helm repo update
```

```
helm install zookeeper bitnami/zookeeper -n kafka \
--set replicaCount=1 \
--set auth.enabled=false \
--set allowAnonymousLogin=true \
--set service.type=NodePort,service.clusterIP="" \
--set nodeSelector."beta\\.kubernetes\\.io/os"=linux \
--set persistence.existingClaim="zookeeper-pv-claim-0"
```

### 4.4: Kafka Helm Kurulumu
Kafka'yı kurmak için aşağıdaki komutu çalıştırın:
```
helm install kafka -n kafka rhcharts/kafka -f Infrastructure/KafkaStack/values-kafka.yaml
```
### 4.5: Kafdrop Kurulumu
Kafdrop, Kafka'ya bağlanarak verileri görselleştirmemize olanak tanır. Aşağıdaki yaml dosyasını kullanarak Kafdrop'u kurun:
```
kubectl apply -f Infrastructure/KafkaStack/kaftdrop.yaml
```

### 4.6: Kafdrop UI'ya Erişim
Kafdrop UI'ya erişim için iki worker node'da da şu adımları izleyin:

VirtualBox üzerinden Adapter1 (NAT) için Port Forwarding kuralını şu şekilde yapılandırın:
 - Host Port: 32560
 - Guest Port: 32560

Tarayıcınızdan http://localhost:32560 adresine giderek Kafdrop UI'ya erişebilirsiniz.

### Adım 5: MongoDB Kurulumu
MongoDB’yi Helm ile kurmak için şu adımları takip edin:


1. Helm chart’ını ekleyin ve güncelleyin:
```
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
```
2. MongoDB’yi kurun:
```
helm install mongodb -n mongodb -f Infrastructure/MongoDB/mongodb-values.yaml bitnami/mongodb
```

Bu adımlar ile MongoDB kurulumu tamamlanacaktır.

Uygulamalar
Aşağıda, projenizin içerdiği ana bileşenler ve ilgili işlevler listelenmiştir:


### Adım 6: Consumer-Listener-Producer'ın Helm Chart ile Kurulumu
Aşağıdaki komut ile Helm Chart üzerinden uygulamayı kurun:

```
helm install  bilira ./BiliraHelmChart -n bilira --create-namespace
```


### Adım 7: Uygulamaları Test Etme Süreci

1. Listener pod’una erişmek için şu komutu çalıştırın:

```
kubectl exec -it <listener-bilira-pod-ismi> -n bilira -- /bin/bash
```

Not:
```
<listener-bilira-pod-ismi> 
```
yerine pod ismini yazmanız gerekiyor. 

Pod ismini öğrenmek için şu komutu kullanabilirsiniz:

```
kubectl get pods -n bilira
```


7.1  Tüm Event'leri Getirme

Tüm Event'leri listelemek için aşağıdaki cURL komutunu çalıştırın:

```
curl -X GET http://localhost:3000/api/events
```
Bu komut, listener servisi tarafından kaydedilen tüm Event'leri döner.

7.2 . EventType'a Göre Filtreleme
Belirli bir Event türüne göre sonuçları filtrelemek için eventType parametresini kullanabilirsiniz:

```
curl -X GET "http://localhost:3000/api/events?eventType=<eventType>" 
```
```
<eventType> 
```
yerine filtrelemek istediğiniz Event türünü yazın.

Örneğin:
```
curl -X GET "http://localhost:3000/api/events?eventType=payment_received"
```

Bu komut, yalnızca belirttiğiniz eventType ile eşleşen Event'leri döner.


7.3 Tarih Aralığına Göre Filtreleme

Event'leri belirli bir tarih aralığında listelemek için startTime ve endTime parametrelerini kullanabilirsiniz:

```
curl -X GET "http://localhost:3000/api/events?startTime=<start-date>&endTime=<end-date>"
```
```
<start-date> ve <end-date>
```
yerine tarihleri ISO 8601 formatında belirtin.

Örneğin:
```
curl -X GET "http://localhost:3000/api/events?startTime=2023-01-01T00:00:00Z&endTime=2023-12-31T23:59:59Z"
```

Bu komut, yalnızca belirttiğiniz tarih aralığına denk gelen Event'leri döner.


7.4  Sayfalama ile Event'leri Getirme
Event'leri sayfa sayfa getirmek için page ve limit parametrelerini kullanabilirsiniz:

```
curl -X GET "http://localhost:3000/api/events?page=<page-number>&limit=<page-size>"
```

```
<page-number> yerine görmek istediğiniz sayfa numarasını yazın.
<page-size> yerine her sayfada kaç Event görmek istediğinizi yazın.
```


Örneğin:

```
curl -X GET "http://localhost:3000/api/events?page=1&limit=10"
```

Bu komut, belirttiğiniz sayfa numarasındaki Event'leri ve her sayfada görmek istediğiniz kadar sonucu döner.


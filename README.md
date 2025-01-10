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
1. Cluster'ımızı ilgili dizin içerisinde aşağıdaki komutu işleterek oluşturuyoruz.

vagrant up

2. KUBECONFIG'i Export ediyoruz ve Kubernetes Cluster'ımıza erişiyoruz.

Ya bu şekilde Export ederek erişebiliriz;
cd VagrantK8s
cd configs
export KUBECONFIG=$(pwd)/config

Ya da Vagrant Klasörü içerisinde ;

vagrant ssh controlplane yaparak.

3. git  ya da wget ile repository'mizi controlplane içerisine çekiyoruz.



### 2.1: Longhorn Kurulumu

Aşağıdaki komutu çalıştırarak Longhorn'u cluster'a yükleyin:

'kubectl apply -f https://raw.githubusercontent.com/longhorn/longhorn/master/deploy/longhorn.yaml'

### 2.2: Longhorn UI'ya Erişim
Longhorn UI'ya erişim için iki worker node'da aşağıdaki adımları uygulayın:

VirtualBox > Settings > Network > Adapter 1 > Advanced > Port Forwarding seçeneğine gidin.
Yeni bir kural ekleyin:
Protocol: TCP
Host IP: Boş bırakabilirsiniz (ya da 127.0.0.1).
Host Port: 30005
Guest Port: 30005
Artık host makinenizden http://localhost:30005 adresini kullanarak Longhorn UI'ya erişebilirsiniz.

### Adım 3: Kafka ve Zookeeper Kurulumu
### 3.1: Kafka Namespace Oluşturma
Öncelikle Kafka için bir namespace oluşturun:
'kubectl create namespace kafka'

### 3.2: Zookeeper Persistent Volume Claim
Zookeeper için Persistent Volume ve PVC oluşturmamız gerekecek.

'kubectl apply -f Infrastructure/KafkaStack/zookeper-pvc.yaml'

### 3.3: Zookeeper Helm Kurulumu

Zookeeper'ı Helm ile kurun:

helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo list
helm repo update

helm install zookeeper bitnami/zookeeper -n kafka \
--set replicaCount=1 \
--set auth.enabled=false \
--set allowAnonymousLogin=true \
--set service.type=NodePort,service.clusterIP="" \
--set nodeSelector."beta\\.kubernetes\\.io/os"=linux \
--set persistence.existingClaim="zookeeper-pv-claim-0"

### 3.4: Kafka Helm Kurulumu
Kafka'yı kurmak için aşağıdaki komutu çalıştırın:

helm install kafka -n kafka rhcharts/kafka -f Infrastructure/KafkaStack/values-kafka.yaml

### 3.5: Kafdrop Kurulumu
Kafdrop, Kafka'ya bağlanarak verileri görselleştirmemize olanak tanır. Aşağıdaki yaml dosyasını kullanarak Kafdrop'u kurun:
'kubectl apply -f Infrastructure/KafkaStack/kaftdrop.yaml

### 3.6: Kafdrop UI'ya Erişim
Kafdrop UI'ya erişim için iki worker node'da da şu adımları izleyin:

VirtualBox > Settings > Network > Adapter 1 > Advanced > Port Forwarding seçeneğine gidin.
Yeni bir kural ekleyin:
Protocol: TCP
Host IP: Boş bırakabilirsiniz (ya da 127.0.0.1).
Host Port: 32560
Guest Port: 32560
Artık host makinenizden http://localhost:32560 adresine giderek Kafdrop UI'ya erişebilirsiniz.

### Adım 4: MongoDB Kurulumu
MongoDB'yi Helm ile kurmak için aşağıdaki adımları izleyin:

helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

helm install mongodb -n mongodb -f Infrastructure/MongoDB/mongodb-values.yaml bitnami/mongodb

Bu adımlar ile MongoDB kurulumu tamamlanacaktır.

Uygulamalar
Aşağıda, projenizin içerdiği ana bileşenler ve ilgili işlevler listelenmiştir:


### Adım 4: Consumer-Listener-Producer'ın Helm Chart ile Kurulumu

helm install  bilira ./BiliraHelmChart -n bilira --create-namespace


### Adım 5: Test Süreci


Kafdrop UI üzerinden gördüğünüz Event'ları Listener Podu içerisinden cURL ile listeleyeğicez.
Bunun için bilira Namespace'i içerisinde bulunan listener-bilira uygulamasının içine kubectl exec -it 
ardından

Tüm Event'leri Getirme

curl -X GET http://localhost:3000/api/events

EventType'a göre Filtreleme

curl -X GET "http://localhost:3000/api/events?eventType=someEventType"

Tarih Aralığına Göre Filtreleme

curl -X GET "http://localhost:3000/api/events?startTime=2023-01-01T00:00:00Z&endTime=2023-12-31T23:59:59Z"

Sayfalama ile Event'leri Getirme

curl -X GET "http://localhost:3000/api/events?page=1&limit=10"


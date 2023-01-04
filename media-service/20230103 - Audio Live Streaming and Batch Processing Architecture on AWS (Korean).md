[< Backward](../README.md)

# Audio Live Streaming and Batch Processing Architecture on AWS (Korean)

본 문서는 온라인 라디오 플랫폼 "스푼 라디오"의 아키텍처 소개 영상인 [Yotubue - Spoon Radio: Audio Live Streaming and Batch Processing Architecture on AWS (Korean)](https://youtu.be/qL3hDtrTeLs)을 참고하여 작성되었습니다.

```cmd
1. Introduce
2. Architecture
    2.1. [Architecture] User Type (00:45)
    2.2. [Architecture] DJ - Live Room (00:47)
    2.3. [Architecture] Listener - Live Room (01:18)
    2.4. [Architecture] Global Service 레이턴시 최소화 (02:20)
    2.5. [Architecture] ElasticCache 사용 사례 (03:08)
    2.6. [Architecture] Aurora, DocumentDB 사용 사례 (04:03)
    2.7. [Architecture] Recognition 사용 사례 (04:40)
```

## 1. Introduce

세상은 많은 사람들의 이야기로 만들어집니다.<br>
스푼 라디오는 그런 이야기를 모으고 연계해주는 실시간 오디오 플랫폼입니다.<br>
스마트폰 하나만 있으면 누구나 언제 어디서든 DJ나 청취자가 될 수 있다는 장점이 있습니다.

## 2. Architecture

### 2.1. [Architecture] User Type (00:45)

스푼 라디오 고객은 DJ나 리스너로 구분이 되는데요.<br>

### 2.2. [Architecture] DJ - Live Room (00:47)

DJ와 라이브방 개설에 대한 플로우에 대해서 소개 드리겠습니다.

<img
    style="width: 400px;"
    src="../img/Spoon%20Radio.png">

DJ가 ALB -> API Server로 라이브방 개설 요청을 합니다.<br>
라이브방 개설과 동시에 다음의 두 가지 요청이 동시에 이루어집니다.

1. API Server -> Chatting Server : 채팅룸 개설
2. API Server -> Streaming Server : 라이브 스트리밍 서버 배정

위와 관련된 모든 정보는 AWS RDS Aurora와 Document DB에 저장이 됩니다.

### 2.3. [Architecture] Listener - Live Room (01:18)

Listener는 ALB -> AI Server로 "어떤 방송을 들을 건지" 요청을 하고 정보를 받을 수 있습니다.<br>
Listener는 CloudFront를 통해서 음원을 들을 수 있고 CloudFront는 NGINX Server를 경유하여 Streaming Server의 음원을 들을 수 있습니다.<br>

또한 Live Streaming의 메타 정보는 ElasticCache를 통해서 캐싱해 사용하고 있습니다.

### 2.4. [Architecture] Global Service 레이턴시 최소화 (02:20)

스푼 라디오는 글로벌 서비스를 하기 떄문에, 네트워크 레이턴시가 가장 중요합니다.<br>
그 중에서도 DJ <-> Streaming Server의 레이턴시가 가장 중요했습니다.<br>
따라서, 스푼 라디오는 AWS의 여러 Region에 Streaming Server를 구성했으며, Route53의 `레이턴시 기반 라우팅 정책`을 사용해서 레이턴시를 최소화하고 있습니다.

### 2.5. [Architecture] ElasticCache 사용 사례 (03:08)

스푼 라디오에서는 총 3가지 경우에 ElasticCache를 사용하고 있습니다.

1. API Server -> ElasticCache Redis
2. Chatting Server -> (Pub/Sub) -> ElasticCache Redis
3. Route53 -> (Dynamic Routing) -> Streaming Serrver -> ElasticCache Redis

### 2.6. [Architecture] Aurora, DocumentDB 사용 사례 (04:03)

DJ와 Listener 간에 교류하는 모든 정보는 RDS Aurora에 저장이 됩니다.<br>
그와 동시에 사용자가 일으키는 모든 서비스 행태들은 Document DB에 저장이 됩니다.<br>

이 두 DB를 이용해서 사용자에게 최적화된 추천 피드를 제공하게 됩니다.

### 2.7. [Architecture] Recognition 사용 사례 (04:40)

일부 DJ분들이 배경화면을 `불건전한 이미지`로 하는 분들이 종종 있습니다.<br>
이를 방지하기 위해서 스푼 라디오에서는 모든 컨텐츠를 저장하고 확인하고 있습니다.

1. 사용자들이 업로드한 컨텐츠는 S3 버킷에 저장됩니다.
2. S3 버킷에 컨텐츠가 저장되면 AWS Lambda가 호출됩니다.
3. 호출된 Lambda는 컨텐츠 정보를 AWS Recognition의 `CONTENT MODREATION`을 이용해서 필터링하여 `운영자`에게 전달이 되게 됩니다.
    1. 건전할 경우 - 제공
    2. 불건전할 경우 - 검수 후 삭제
docker build -t eu.gcr.io/token4good/t4g-daemon:staging -f apps/daemon/Dockerfile . && \
docker push eu.gcr.io/token4good/t4g-daemon:staging && \
gcloud compute instances update-container daemon-staging --project=token4good && \
open "https://console.cloud.google.com/logs/query;query=%2528resource.type%3D%22gce_instance%22%20AND%20resource.labels.instance_id%3D%224570569109974221904%22%2529%20OR%20%2528resource.type%3D%22global%22%20AND%20jsonPayload.instance.id%3D%224570569109974221904%22%2529;cursorTimestamp=2023-05-02T11:30:02.217028799Z?project=token4good"
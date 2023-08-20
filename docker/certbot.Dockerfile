FROM certbot/certbot

RUN apk add --no-cache bash

ENTRYPOINT []

CMD ["sh", "-c", "certbot certonly --webroot -w /tmp/acme_challenge -d mumsmums.app --text --agree-tos --email sofie.l.thorsen@gmail.com --rsa-key-size 4096 --verbose --keep-until-expiring --preferred-challenges=http"]

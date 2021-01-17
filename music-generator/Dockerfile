FROM ubuntu:18.04

WORKDIR /usr/src/app

RUN apt-get update -y
RUN apt-get upgrade -y
RUN apt-get install -y python3-dev python3-pip libsndfile1-dev
RUN pip3 install --upgrade pip

COPY requirements.txt .

RUN pip3 install --use-deprecated=legacy-resolver -r requirements.txt

COPY . .

CMD [ "python3", "./unconditional_sample.py", "-model_path=./model/checkpoints/unconditional_model_16.ckpt", "-output_dir=./output", "-decode_length=1024", "-num_samples=100000", "-log=ERROR" ]

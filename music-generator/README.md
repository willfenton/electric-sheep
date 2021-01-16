# Music Generator

Docker container which generates music in MIDI format using Google Magenta's [Music Transformer](https://magenta.tensorflow.org/music-transformer) model.

The generation code (`unconditional_sample.py` and `utils.py`) came from [Elvenson's Piano Transformer repo](https://github.com/Elvenson/piano_transformer).

Pre-trained model goes in `/music-generator/model/checkpoints`.

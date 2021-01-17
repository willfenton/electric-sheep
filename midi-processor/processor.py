import os
import shutil
import time
import re
import json
import random

filename_pattern = "([0-9]+)\.mid"
filename_regex = re.compile(filename_pattern)

unprocessed_dir = "./unprocessed"
processed_dir = "./processed"

titles = [
    "ML Sonata",
    "Clair de Loss",
    "Uptown Feedforward!",
    "Party RNN Anthem",
    "Some Network That I Used To know",
    "Scalar Mode",
    "All About That Bias",
    "Can't Feel My Weights",
    "Old Town Random Forest",
    "Datacito",
    "Classify Me Maybe",
    "Blurred Losses",
    "Semi-Supervised And I Know It",
    "California GANs",
    "Hey Soul Scalar",
    "I Got A Feature",
    "GAN's Plan",
    "Heuristics Don't Lie",
    "Shape of You(r layers)"
]

artist_names = [
    "Deep Blue",
    "AlphaGo",
    "HAL 9000",
    "Siri",
    "Alexa",
    "Google Assistant",
    "Tesla Autopilot",
    "TARS",
    "C3PO",
    "Agent Smith",
    "Wall-E",
    "Boston Dynamics Spot",
    "Boston Dynamics Atlas",
    "IBM Watson",
    "GPT-3",
    "AlphaFold",
    "Skynet",
    "Your first MNIST model",
    "J.A.R.V.I.S",
    "GLaDOS",
    "T-800"
]

def generate_title():
    return random.choice(titles)


def generate_artist():
    return random.choice(artist_names)


def process_midi_files():
    print("Processing MIDI files")

    max_index = 0

    # check processed dir for highest index
    for subdir, dirs, files in os.walk(processed_dir):
        for file in files:
            filepath = subdir + os.sep + file
            if filepath.endswith(".mid"):
                result = filename_regex.search(file)
                if result:
                    index = int(result.group(1))
                    if index > max_index:
                        max_index = index

    print(f"Max index found was {max_index}")

    # check unprocessed dir for new midi files
    for subdir, dirs, files in os.walk(unprocessed_dir):
        for file in files:
            filepath = subdir + os.sep + file

            if filepath.endswith(".mid"):
                new_index = max_index + 1
                max_index = new_index

                last_modified_time = int(os.path.getmtime(filepath))

                # move file
                target_filepath = f"{processed_dir}/{new_index}.mid"
                shutil.move(filepath, target_filepath)
                print(f"Moved {filepath} to {target_filepath}")

                # write file info
                info = {
                    "timestamp": last_modified_time,
                    "title": generate_title(),
                    "artist": generate_artist(),
                    "hue": random.randint(0, 359),
                    "random_seed": random.randint(0, 1000000)
                }
                print(f"Track info: {info}")
                info_filepath = f"{processed_dir}/{new_index}.json"
                with open(info_filepath, "w") as f:
                    f.write(json.dumps(info))
                print(f"Wrote track info to {info_filepath}")

    print("Done processing MIDI files")

if __name__ == "__main__":
    while True:
        process_midi_files()
        time.sleep(10)

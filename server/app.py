from flask import Flask
from flask import render_template
import re
import os

filename_pattern = "([0-9]+)\.mid"
filename_regex = re.compile(filename_pattern)

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

# return the number of MIDI files
@app.route("/api/count")
def count():
    max_index = 0

    for subdir, dirs, files in os.walk("./static/midi"):
        for file in files:
            filepath = subdir + os.sep + file
            if filepath.endswith(".mid"):
                result = filename_regex.search(file)
                if result:
                    index = int(result.group(1))
                    if index > max_index:
                        max_index = index
    
    return {
        "count": max_index
    }


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=80, debug=True)

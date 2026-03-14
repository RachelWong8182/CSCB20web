from flask import Flask, render_template, request

app = Flask(__name__, template_folder='html', static_folder='.', static_url_path='')

@app.route('/')
def mainpage():
    return render_template('mainpage.html')

app.run(debug = True)

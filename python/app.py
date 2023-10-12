# from signal-k/sytizen in submodule
from flask import Flask, request, render_template, jsonify
import lightkurve as lk
import matplotlib.pyplot as plt
from io import BytesIO
import base64
import requests
import json
import numpy as np

app = Flask(__name__)

from flask import Flask, request, render_template
import lightkurve as lk
import matplotlib.pyplot as plt
import numpy as np

app = Flask(__name__)

# def calculate_number_of_trees(habitability, flux, amplitude):
#     # Set the thresholds and corresponding factors for habitability, flux, and amplitude
#     habitability_thresholds = [40, 70]  # Adjust these values as needed
#     habitability_factors = [0.5, 1.0]  # Adjust these values as needed

#     flux_thresholds = [0.01, 0.1, 1.0]  # Adjust these values as needed
#     flux_factors = [1.01, 1.1, 1.5]  # Adjust these values as needed

#     amplitude_thresholds = [0.1, 0.5, 1.0]  # Adjust these values as needed
#     amplitude_factors = [1.01, 1.1, 1.5]  # Adjust these values as needed

#     # Extract the value from the habitability, flux, and amplitude quantities if they are quantities
#     if hasattr(habitability, 'value'):
#         habitability = habitability.value
#     if hasattr(flux, 'value'):
#         flux = flux.value
#     if hasattr(amplitude, 'value'):
#         amplitude = amplitude.value

#     # Determine the habitability factor based on the habitability score
#     habitability_factor = 1.0
#     for i, threshold in enumerate(habitability_thresholds):
#         if habitability >= threshold:
#             habitability_factor = habitability_factors[i]
#             break

#     # Determine the flux factor based on the flux value
#     flux_factor = 1.0
#     for i, threshold in enumerate(flux_thresholds):
#         if flux < threshold:
#             flux_factor = flux_factors[i]
#             break

#     # Determine the amplitude factor based on the amplitude value
#     amplitude_factor = 1.0
#     for i, threshold in enumerate(amplitude_thresholds):
#         if amplitude < threshold:
#             amplitude_factor = amplitude_factors[i]
#             break

#     # Calculate the number of trees based on habitability, flux, and amplitude factors
#     num_trees = int(habitability * habitability_factor * flux_factor * amplitude_factor)

#     return num_trees

def calculate_number_of_trees(habitability):
    # Set the thresholds and corresponding number of trees
    thresholds = [10, 40, 70, 100]  # Adjust these values as needed
    num_trees = [1, 10, 40, 60]  # Adjust these values as needed

    # Extract the value from the habitability quantity if it's a quantity
    if hasattr(habitability, 'value'):
        habitability = habitability.value

    # Find the corresponding number of trees based on the habitability score
    for i, threshold in enumerate(thresholds):
        if habitability < threshold:
            return num_trees[i], num_trees

    # If the habitability score is above the highest threshold, return the highest number of trees
    return num_trees[-1]

def determine_habitability(num_trees, amplitude):
    # Convert the num_trees and amplitude to dimensionless scalars if they have units
    num_trees = num_trees.value if hasattr(num_trees, "value") else num_trees
    amplitude = amplitude.value if hasattr(amplitude, "value") else amplitude

    # Calculate habitability as a combination of the number of trees and amplitude
    habitability = (num_trees * 10) + (amplitude * 1000)
    return habitability

def determine_life_type(habitability):
    # Determine the most likely type of life based on habitability score
    if habitability >= 80:
        return "Advanced life forms such as animals and plants"
    elif habitability >= 60:
        return "Complex life forms such as fungi and multicellular organisms"
    elif habitability >= 40:
        return "Microbial life such as bacteria and archaea"
    else:
        return "No known life forms"

def determine_resource_type(star_radius, planet_radius):
    # Determine the resource type based on star and planet radius
    if star_radius > 1.0 and planet_radius > 1.0:
        return "Heavy elements such as gold, silver, and iron"
    else:
        return "Basic resources such as carbon and minerals"

@app.route('/', methods=["GET", "POST"])
def index():
    if request.method == 'POST':
        tic_id = request.form['tic_id']

        try:
            lc = lk.search_lightcurve(tic_id).download()
            flux = lc.flux
            median_flux = np.nanmedian(flux)  # Calculate the median using numpy

            # Calculate the number of trees based on the median flux
            num_trees = calculate_number_of_trees(median_flux)

            # Determine habitability score
            habitability = determine_habitability(num_trees, median_flux)

            # Determine the most likely type of life
            life_type = determine_life_type(habitability)

            # Determine the resource type based on star and planet radius
            star_radius = 1.0  # Assumption: Radius of the star is equal to the Sun's radius
            planet_radius = median_flux * star_radius

            resource_type = determine_resource_type(star_radius, planet_radius)

            return render_template('result.html', tic_id=tic_id, amplitude=median_flux, num_trees=num_trees, habitability=habitability,
                                   life_type=life_type, resource_type=resource_type)
        except Exception as e:
            error_message = str(e)
            return render_template('error.html', error_message=error_message)

    return render_template('index.html')

def determine_planet_type(star_radius, star_mass, period, median_flux):
    # Perform the planet type determination logic based on star information, period, and median flux
    # Adjust the conditions and thresholds as needed for your classification scheme
    if star_radius < 1.0 and star_mass < 1.0 and period < 10 and median_flux < 0.5:
        return "Rocky Planet"
    elif star_radius > 1.0 and star_mass > 1.0 and period > 100 and median_flux > 1.0:
        return "Gas Giant"
    else:
        return "Unknown"

@app.route('/result')
def result():
    return render_template('result.html')

def calculate_number_of_trees_amplitude(amplitude):
    thresholds = [0.1, 0.5, 1.0] # Thresholds and corresponding number of trees
    num_trees = [10, 5, 1]

    # Find the number of trees based on amplitude
    for i, threshold in enumerate(thresholds):
        if amplitude < threshold:
            return num_trees[i]

    return num_trees[-1]

@app.route('/api/trees', methods=["POST"])
def tree_query():
    tic_id = request.json.get('tic_id') # Retrieve tic from the api request
    try:
        # Query & Process the TIC ID
        lc = lk.search_lightcurve(tic_id).download()
        flux = lc.flux
        median_flux = np.nanmedian(flux).value
        num_trees = calculate_number_of_trees(median_flux)

        response_data = {
            'num_trees': num_trees,
        }

        return jsonify(response_data), 200
    
    except Exception as e:
        error_message = str(e)
        return jsonify({'error': error_message}), 400

@app.route('/api/query', methods=["POST"])
def query():
    tic_id = request.json.get('tic_id') # Retrieve tic from the api request
    try:
        # Query & Process the TIC ID
        lc = lk.search_lightcurve(tic_id).download()
        flux = lc.flux
        median_flux = np.nanmedian(flux).value
        num_trees = calculate_number_of_trees(median_flux)

        # Convert the flux ndarray to a regular ndarray
        # flux = flux.data if hasattr(flux, 'data') else flux
        flux_values = flux.value.tolist()

        # Convert the data into a format acceptable for the output response
        response_data = {
            'tic_id': tic_id,
            'median_flux': median_flux,
            'num_trees': num_trees,
            'flux': flux_values
        }

        return jsonify(response_data), 200
    
    except Exception as e:
        error_message = str(e)
        return jsonify({'error': error_message}), 400

def get_transit_parameters(tic_id):
    url = f"https://exo.mast.stsci.edu/api/v0.1/exoplanets/identifiers/"
    payload = {
        "input": tic_id,
        "columns": "t0, period"
    }
    response = requests.get(url, params=payload)

    try:
        response.raise_for_status()
        data = response.json()

        # Extract the transit parameters from the response
        if data["data"]:
            period = data["data"][0]["period"]
            t0 = data["data"][0]["t0"]
            return period, t0

        # Handle the case when data is not available for the TIC ID
        error_message = f"No transit parameters available for TIC ID {tic_id}"
    except requests.exceptions.HTTPError as e:
        error_message = f"HTTP Error: {e}"
    except json.JSONDecodeError as e:
        error_message = f"JSON Decode Error: {e}"
    except KeyError as e:
        error_message = f"Key Error: {e}"
    except Exception as e:
        error_message = str(e)

    # Print or log the error message for debugging
    print(f"Error retrieving transit parameters for TIC ID {tic_id}: {error_message}")

    # Return default values or handle the error condition as needed
    return None, None

@app.route('/tic', methods=["GET", "POST"])
def tic_index():
    if request.method == 'POST':
        tic_id = request.form['tic_id']
        tic_numerals = ''.join(filter(str.isdigit, tic_id))

        try:
            lc = lk.search_lightcurve(tic_id).download()
            lc.plot()
            # Save the plot as a bytes object
            image_bytes = BytesIO()
            plt.savefig(image_bytes, format='png')
            plt.close()
            image_bytes.seek(0)
            # Convert the bytes object to base64 string for embedding in HTML
            encoded_image = base64.b64encode(image_bytes.getvalue()).decode('utf-8')

            # Retrieve transit parameters from the NASA Exoplanet Archive API
            period, t0 = get_transit_parameters(tic_id)

            return render_template('result1.html', image_data=encoded_image, tic_numerals=tic_numerals, period=period, t0=t0)

        except Exception as e:
            error_message = str(e)
            return render_template('error1.html', error_message=error_message)

    return render_template('index1.html')

@app.route('/result1')
def result1():
    return render_template('result1.html')

if __name__ == '__main__':
    app.run() # Show flask app to the side of deepnote/planet, colouring for console, display latest feed from Supabase, iframe alternative to play.skinetics.tech in the index dir. Also add in actual API functionality. Send a request from Unity, get the tic id, only return the number of trees for that endpoint, update trees variable value. Get some method to save this in a supabase table/unity editor to save on loading times, do a search on exofop for any confirmed statuses for the chosen tic id?, allow customisation methods based on returned values. Deploying flask app on Zima/rpi/urbit?
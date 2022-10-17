from flask import Flask, request, jsonify
import lightkurve as lk
import logging
import numpy as np

app = Flask(__name__)

@app.route('/lightcurve/summary', methods=['POST'])
def get_lightcurve_summary():
    try:
        request_data = request.get_json()
        if not request_data or 'tic_id' not in request_data:
            return jsonify({'error': 'Missing required field "tic_id"'}), 400

        tic_id = request_data['tic_id']
        if not tic_id.startswith("TIC "):
            return jsonify({'error': 'Invalid TIC ID format'}), 400

        lightcurve_data = lk.search_lightcurve(tic_id).download()
        if lightcurve_data is None:
            return jsonify({'error': 'No light curve found'}), 404

        flux_values = lightcurve_data.flux.value
        statistics_summary = {
            'mean': float(np.mean(flux_values)),
            'median': float(np.median(flux_values)),
            'standard_deviation': float(np.std(flux_values)),
            'peak_to_peak': float(np.ptp(flux_values)),
            'interquartile_range': float(np.percentile(flux_values, 75) - np.percentile(flux_values, 25)),
        }

        return jsonify(statistics_summary)

    except Exception as e:
        logging.error(f"Error processing request: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
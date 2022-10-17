from flask import Flask, jsonify
from supabase_py import create_client

app = Flask(__name__)

# app.config["SQLALCHEMY_DATABASE_URI"] = ""
# db.init_app(app)

# Create Supabase client 
SUPABASE_URL = 'https://qwbufbmxkjfaikoloudl.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3YnVmYm14a2pmYWlrb2xvdWRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Njk5NDE3NTksImV4cCI6MTk4NTUxNzc1OX0.RNz5bvsVwLvfYpZtUjy0vBPcho53_VS2AIVzT8Fm-lk'
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

@app.route('/test')
def test():
    return "Test"

# Route to fetch items from inventoryITEMS table
@app.route('/items')
def get_items():
    # Query items from inventoryITEMS table
    items = supabase.table('inventoryITEMS').select('*').execute()
    return jsonify(items['data'])

# Route to fetch user inventory from inventoryUSERS table
@app.route('/inventory/<user_id>')
def get_user_inventory(user_id):
    # Query user inventory from inventoryUSERS table
    user_inventory = supabase.table('inventoryUSERS').select('*').eq('owner', user_id).execute()
    return jsonify(user_inventory['data'])

# Main function to run the Flask app
if __name__ == '__main__':
    app.run(debug=True)
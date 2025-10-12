import os
import asyncio
import threading
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from agents import Agent, Runner, set_tracing_disabled
from agents.extensions.models.litellm_model import LitellmModel

# Set up asyncio policy for Windows
if os.name == 'nt':  # Windows
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

# Disable tracing for cleaner output
set_tracing_disabled(disabled=True)

# Load environment variables from .env file
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Simple and comprehensive CORS setup
CORS(app, 
     origins=["*"],  # Allow all origins for now to test
     methods=["GET", "POST", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
     supports_credentials=False)  # Set to False for testing

# Add manual CORS headers as backup
@app.after_request
def after_request(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization,X-Requested-With'
    response.headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS'
    response.headers['Access-Control-Allow-Credentials'] = 'false'
    return response

# Get Gemini API key
gemini_api_key = os.getenv("GEMINI_API_KEY")

if not gemini_api_key:
    raise ValueError("GEMINI_API_KEY is not set in .env file.")

print(f"Flask app initialized with API key: {gemini_api_key[:10]}...")

# Initialize the agent once
agent = Agent(
    name="Assistant",
    instructions="You are a helpful assistant. Provide clear, concise, and helpful responses.",
    model=LitellmModel(model="gemini/gemini-2.0-flash", api_key=gemini_api_key),
)

# Simple direct approach - just try to run the agent
def run_agent_safely(user_message):
    try:
        print(f"Attempting to run agent with message: '{user_message}'")
        
        # Set up asyncio policy for Windows if needed
        import asyncio
        if hasattr(asyncio, 'WindowsProactorEventLoopPolicy'):
            asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
        
        # Try to get or create an event loop
        try:
            loop = asyncio.get_event_loop()
            if loop.is_closed():
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
        except RuntimeError:
            # No event loop in current thread, create one
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
        
        print("Event loop setup complete, running agent...")
        
        # Try to run the agent directly
        result = Runner.run_sync(agent, input=user_message)
        print(f"Agent completed successfully with result: {result.final_output[:100]}...")
        return result.final_output
        
    except Exception as e:
        error_msg = str(e)
        print(f"Agent execution failed with error: {error_msg}")
        
        # Provide user-friendly error messages
        if "event loop" in error_msg.lower():
            return "I'm currently experiencing technical difficulties with the event loop. This is a known issue we're working to resolve. Please try again in a moment."
        elif "timeout" in error_msg.lower():
            return "The request took too long to process. Please try with a shorter message."
        elif "api" in error_msg.lower() or "key" in error_msg.lower():
            return "There's an issue with the AI service configuration. Please contact support."
        else:
            return f"I encountered an unexpected error: {error_msg}. Please try again or contact support if the issue persists."
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# Get Gemini API key
gemini_api_key = os.getenv("GEMINI_API_KEY")

if not gemini_api_key:
    raise ValueError("GEMINI_API_KEY is not set in .env file.")

# Initialize the agent once
agent = Agent(
    name="Assistant",
    instructions="You are a helpful assistant. Provide clear, concise, and helpful responses.",
    model=LitellmModel(model="gemini/gemini-2.0-flash", api_key=gemini_api_key),
)

@app.route('/')
def index():
    """API info endpoint"""
    return jsonify({
        "message": "AI Assistant API Server",
        "status": "running",
        "endpoints": {
            "chat": "/chat (POST)",
            "health": "/health (GET)"
        }
    })

@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "AI Assistant API"})

@app.route('/test', methods=['GET', 'POST', 'OPTIONS'])
def test():
    """Test endpoint for CORS"""
    if request.method == 'OPTIONS':
        return '', 200
    return jsonify({"message": "CORS test successful", "method": request.method})

@app.route('/chat', methods=['POST', 'OPTIONS'])
def chat():
    """Handle chat messages"""
    print(f"Chat endpoint called with method: {request.method}")
    print(f"Request headers: {dict(request.headers)}")
    
    if request.method == 'OPTIONS':
        print("Handling OPTIONS request for CORS preflight")
        response = app.make_default_options_response()
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        return response
        
    try:
        data = request.get_json()
        print(f"Received data: {data}")
        user_message = data.get('message', '').strip()
        print(f"User message: {user_message}")
        
        if not user_message:
            return jsonify({'error': 'Message cannot be empty'}), 400
        
        # Run the agent with user input using thread-safe function
        agent_response = run_agent_safely(user_message)
        print(f"Agent result: {agent_response}")
        
        response_data = {
            'response': agent_response,
            'status': 'success'
        }
        print(f"Sending response: {response_data}")
        
        return jsonify(response_data)
        
    except Exception as e:
        return jsonify({
            'error': f'An error occurred: {str(e)}',
            'status': 'error'
        }), 500

if __name__ == '__main__':
    print("Starting ChatGPT-like AI Assistant...")
    print("Open your browser and go to: http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
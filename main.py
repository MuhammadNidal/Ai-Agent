import os
from dotenv import load_dotenv
from agents import Agent, Runner, set_tracing_disabled
from agents.extensions.models.litellm_model import LitellmModel

# Disable tracing for cleaner output
set_tracing_disabled(disabled=True)

# Load environment variables from .env file
load_dotenv()

gemini_api_key = os.getenv("GEMINI_API_KEY")

if not gemini_api_key:
    raise ValueError("GEMINI_API_KEY is not set in .env file.")

print("Gemini API Key loaded successfully.", gemini_api_key)

def main():
    agent = Agent(
        name="Assistant",
        instructions="You are a helpful assistant.",
        model=LitellmModel(model="gemini/gemini-2.0-flash", api_key=gemini_api_key),
    )

    print("Welcome! Type your message below (type 'quit' or 'exit' to stop):")
    
    while True:
        try:
            # Get user input
            user_input = input("\nYou: ").strip()
            
            # Check if user wants to quit
            if user_input.lower() in ['quit', 'exit', 'q']:
                print("Goodbye!")
                break
            
            # Skip empty inputs
            if not user_input:
                print("Please enter a message.")
                continue
            
            print("\nCALLING AGENT...")
            print("-" * 50)
            
            # Run the agent with user input
            result = Runner.run_sync(agent, input=user_input)
            
            print(f"\nAssistant: {result.final_output}")
            print("-" * 50)
            
        except KeyboardInterrupt:
            print("\n\nGoodbye!")
            break
        except Exception as e:
            print(f"\nError: {e}")
            print("Please try again.")

if __name__ == "__main__":
    main()

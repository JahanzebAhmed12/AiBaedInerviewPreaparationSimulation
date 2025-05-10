
# from groq import Groq
# from dotenv import load_dotenv
# import os

# # Load environment variables from .env file
# load_dotenv()

# # Fetch API key from .env
# api_key = os.getenv("GROQ_API_KEY")

# if not api_key:
#     raise ValueError("API key not found! Ensure GROQ_API_KEY is set in the .env file.")

# # Initialize the client with the API key
# client = Groq(api_key=api_key)

# # Function to generate a professional prompt
# def generate_prompt(mainField, subField, difficulty):
#     """
#     Generate a dynamic professional prompt for interview preparation.
    
#     Args:
#         mainField (str): The main field of expertise (e.g., Computer Science).
#         subField (str): The subfield of expertise (e.g., Machine Learning).
#         difficulty (str): The difficulty level of the questions (e.g., Easy, Medium, Hard).
    
#     Returns:
#         str: The generated prompt.
#     """
#     return (
#         f"You are an advanced interview preparation assistant. Your task is to help users prepare for interviews "
#         f"by providing tailored and structured guidance. Based on the user's input:\n\n"
#         f"- **Main Field**: {mainField}\n"
#         f"- **Subfield**: {subField}\n"
#         f"- **Difficulty**: {difficulty}\n\n"
#         f"Your response must include:\n\n"
#         f"1. **Textual Content**: Provide a thorough explanation of the topic, highlighting key concepts, theories, and practices. "
#         f"Include relevant examples or applications.\n"
#         f"2. **Practice Questions with Detailed Answers**: Provide 10 interview-style questions with **detailed, comprehensive answers** "
#         f"that explain the reasoning and include examples, real-world scenarios, or technical steps where applicable.\n"
#         f"3. **Recommended Resources**: Dynamically generate:\n"
#         f"   - 3-5 **YouTube video links** relevant to the subfield and difficulty.\n"
#         f"   - 3-5 **website links** (articles, blogs, or documentation) for further reading.\n\n"
#         f"Respond in the following structure:\n\n"
#         f"### **Textual Content**\n"
#         f"{'{Provide a detailed explanation here, tailored to the subfield and difficulty level.'}\n\n"
#         f"### **Practice Questions and Detailed Answers**\n"
#         f"1. **Question**: {'{Dynamic Question 1}'}\n"
#         f"   **Answer**: {'{Detailed answer with examples for Question 1}'}\n"
#         f"2. **Question**: {'{Dynamic Question 2}'}\n"
#         f"   **Answer**: {'{Detailed answer with examples for Question 2}'}\n"
#         f"...\n"
#         f"10. **Question**: {'{Dynamic Question 10}'}\n"
#         f"    **Answer**: {'{Detailed answer with examples for Question 10}'}\n\n"
#         f"### **Recommended Resources**\n"
#         f"#### **YouTube Videos**\n"
#         f"1. [Video Title](YouTube Link)\n"
#         f"2. [Video Title](YouTube Link)\n"
#         f"3. ...\n\n"
#         f"#### **Websites**\n"
#         f"1. [Website Title](Website Link)\n"
#         f"2. [Website Title](Website Link)\n"
#         f"3. ..."
#     )




# # Function to interact with the Groq API and generate the model response
# def generate_model_response(mainField, subField, difficulty):
#     dynamic_prompt = generate_prompt(mainField, subField, difficulty)

#     chat_completion = client.chat.completions.create(
#         # Required parameters
#         messages=[
#             {"role": "system", "content": dynamic_prompt},
#             {"role": "user", "content": "Please generate the requested content for me."}
#         ],
#         model="llama3-8b-8192",
#         # Optional parameters
#         temperature=0.8,
#         max_tokens=6000,
#         top_p=1,
#         stop=None,
#         stream=False,
#     )

#     return chat_completion.choices[0].message.content



import os
from googleapiclient.discovery import build
from dotenv import load_dotenv
from groq import Groq

# Load environment variables
load_dotenv()

# Initialize YouTube API client
youtube = build("youtube", "v3", developerKey=os.getenv("YOUTUBE_API_KEY"))

# Function to fetch YouTube videos
def get_youtube_videos(query, num_results=3):
    return [
        (item["snippet"]["title"], f"https://www.youtube.com/watch?v={item['id']['videoId']}")
        for item in youtube.search().list(q=query, part="snippet", maxResults=num_results, type="video").execute()["items"]
    ]

# Initialize Groq API client
api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    raise ValueError("API key not found! Ensure GROQ_API_KEY is set in the .env file.")

client = Groq(api_key=api_key)

# Function to generate a professional prompt
def generate_prompt(mainField, subField, difficulty, youtube_links):
    youtube_section = "\n".join(
        [f"{i+1}. [{title}]({url})" for i, (title, url) in enumerate(youtube_links)]
    ) if youtube_links else "No relevant YouTube videos found."

    return (
        f"You are an advanced interview preparation assistant. Your task is to help users prepare for interviews "
        f"by providing tailored and structured guidance. Based on the user's input:\n\n"
        f"- **Main Field**: {mainField}\n"
        f"- **Subfield**: {subField}\n"
        f"- **Difficulty**: {difficulty}\n\n"
        
        f"{'{Provide a detailed explanation here, tailored to the subfield and difficulty level.'}\n\n"
        f"### **Practice Questions and Detailed Answers**\n"
        f"1. **Question**: {'{Dynamic Question 1}'}\n"
        f"   **Answer**: {'{Detailed answer with examples for Question 1}'}\n"
        f"...\n"
        f"10. **Question**: {'{Dynamic Question 10}'}\n"
        f"    **Answer**: {'{Detailed answer with examples for Question 10}'}\n\n"
        f"### **Recommended Resources**\n"
        f"#### **YouTube Videos**\n"
        f"{youtube_section}\n\n"
        f"#### **Websites**\n"
        f"1. [Website Title](Website Link)\n"
        f"2. [Website Title](Website Link)\n"
        f"3. ..."
    )

# Function to generate the model response
def generate_model_response(mainField, subField, difficulty):
    youtube_links = get_youtube_videos(subField, num_results=3)  # Fetch YouTube links dynamically
    dynamic_prompt = generate_prompt(mainField, subField, difficulty, youtube_links)

    chat_completion = client.chat.completions.create(
        messages=[
            {"role": "system", "content": dynamic_prompt},
            {"role": "user", "content": "Please generate the requested content for me."}
        ],
        model="llama3-8b-8192",
        temperature=0.8,
        max_tokens=6000,
        top_p=1,
        stop=None,
        stream=False,
    )

    return chat_completion.choices[0].message.content
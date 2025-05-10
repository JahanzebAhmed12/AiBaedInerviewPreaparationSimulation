import os
from googleapiclient.discovery import build
from dotenv import load_dotenv
from groq import Groq
from flask import Flask, request, jsonify
from flask_cors import CORS
import markdown
import re

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize YouTube API client
youtube = build("youtube", "v3", developerKey=os.getenv("YOUTUBE_API_KEY"))

# Function to fetch YouTube videos
def get_youtube_videos(query, num_results=3):
    try:
        search_response = youtube.search().list(
            q=query, 
            part="snippet", 
            maxResults=num_results, 
            type="video"
        ).execute()
        
        return [
            (item["snippet"]["title"], f"https://www.youtube.com/watch?v={item['id']['videoId']}")
            for item in search_response.get("items", [])
        ]
    except Exception as e:
        print(f"Error fetching YouTube videos: {e}")
        return []

# Initialize Groq API client
api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    print("Warning: API key not found! Ensure GROQ_API_KEY is set in the .env file.")
    client = None
else:
    client = Groq(api_key=api_key)

def generate_prompt(mainField, subField, difficulty, youtube_links):
    # Format YouTube videos as embedded iframes in a grid
    youtube_section = "\n".join([
        f"<div class='video-card'>"
        f"<div class='video-container'>"
        f"<iframe src='https://www.youtube.com/embed/{url.split('v=')[1]}' "
        f"title='{title}' frameborder='0' "
        f"allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' "
        f"allowfullscreen></iframe>"
        f"</div>"
        f"<h4>{title}</h4>"
        f"</div>"
        for title, url in youtube_links
    ]) if youtube_links else "No relevant YouTube videos found."

    return (
        f"You are an advanced interview preparation assistant. Your task is to help users prepare for interviews "
        f"by providing tailored and structured guidance. Based on the user's input:\n\n"
        f"- Main Field: {mainField}\n"
        f"- Subfield: {subField}\n"
        f"- Difficulty: {difficulty}\n\n"
        
        f"Create detailed content with the following sections. Format your response in Markdown:\n\n"
        f"<div class='main-title'>{subField} Interview Preparation ({difficulty} Level)</div>\n\n"
        
        f"<div class='section-title'>Practice Questions and Detailed Answers</div>\n"
        f"<div class='qa-section'>\n"
        f"<div class='qa-item'>\n"
        f"<div class='question'>Q: What are the key responsibilities of a {subField} professional?</div>\n"
        f"<div class='answer'>A: A {subField} professional is responsible for [detailed explanation with examples and best practices]</div>\n"
        f"</div>\n\n"
        f"<div class='qa-item'>\n"
        f"<div class='question'>Q: How do you approach [specific {subField} challenge]?</div>\n"
        f"<div class='answer'>A: The approach involves [step-by-step explanation with practical examples]</div>\n"
        f"</div>\n\n"
        f"<div class='qa-item'>\n"
        f"<div class='question'>Q: What are the most important skills for {subField} at {difficulty} level?</div>\n"
        f"<div class='answer'>A: The key skills include [detailed breakdown with explanations]</div>\n"
        f"</div>\n\n"
        f"<div class='qa-item'>\n"
        f"<div class='question'>Q: How do you stay updated with the latest trends in {subField}?</div>\n"
        f"<div class='answer'>A: Staying updated requires [practical strategies and resources]</div>\n"
        f"</div>\n\n"
        f"<div class='qa-item'>\n"
        f"<div class='question'>Q: What are common challenges in {subField} and how do you overcome them?</div>\n"
        f"<div class='answer'>A: Common challenges include [specific examples with solutions]</div>\n"
        f"</div>\n"
        f"</div>\n\n"
        
        f"<div class='section-title'>Key Concepts</div>\n"
        f"<div class='concepts-section'>\n"
        f"<p>1. Core Principles</p>\n"
        f"<p>Understanding the fundamental principles of {subField} is essential. These include [detailed explanation with examples]</p>\n\n"
        f"<p>2. Best Practices</p>\n"
        f"<p>Following industry best practices ensures [explanation of importance and implementation]</p>\n\n"
        f"<p>3. Common Tools and Technologies</p>\n"
        f"<p>Familiarity with key tools and technologies is crucial. These include [list with brief descriptions]</p>\n\n"
        f"<p>4. Problem-Solving Approach</p>\n"
        f"<p>A systematic approach to problem-solving involves [step-by-step methodology]</p>\n"
        f"</div>\n\n"
        
        f"<div class='section-title'>Learning Resources</div>\n"
        f"<div class='subsection-title'>Books and Articles</div>\n"
        f"<div class='resources-section'>\n"
        f"<ul>\n"
        f"<li>\"[Book Title 1]\" - [Author Name] - [Brief description of why this book is valuable for {subField}]</li>\n"
        f"<li>\"[Book Title 2]\" - [Author Name] - [Brief description of key learnings and practical applications]</li>\n"
        f"<li>\"[Book Title 3]\" - [Author Name] - [Brief description of advanced concepts and real-world examples]</li>\n"
        f"</ul>\n"
        f"</div>\n\n"
        
        f"<div class='subsection-title'>Video Tutorials</div>\n"
        f"<div class='videos-grid'>\n"
        f"{youtube_section}\n"
        f"</div>"
    )

def markdown_to_html(markdown_text):
    # Convert markdown to basic HTML
    html = markdown.markdown(markdown_text)
    
    # Add custom classes to improve styling
    html = html.replace('<h2>', '<h2 class="section-title">')
    html = html.replace('<h3>', '<h3 class="subsection-title">')
    html = html.replace('<h4>', '<h4 class="resource-title">')
    
    # Improve Q&A section
    html = re.sub(
        r'<div class=\'question\'>([^<]+)</div>',
        r'<div class="question"><strong>Q:</strong> \1</div>',
        html
    )
    html = re.sub(
        r'<div class=\'answer\'>([^<]+)</div>',
        r'<div class="answer"><strong>A:</strong> \1</div>',
        html
    )
    
    return html

def generate_model_response(mainField, subField, difficulty):
    search_query = f"{mainField} {subField} {difficulty} tutorial"
    youtube_links = get_youtube_videos(search_query, num_results=3)
    dynamic_prompt = generate_prompt(mainField, subField, difficulty, youtube_links)

    # If Groq client is not available, return a mock response
    if client is None:
        mock_content = f"""
        ## {subField} Interview Preparation ({difficulty} Level)
        
        ### Key Concepts
        1. **Concept 1**: This is mock content since the Groq API key is not available.
        2. **Concept 2**: Another mock concept explanation.
        3. **Concept 3**: A third mock concept explanation.
        
        ### Learning Resources
        #### Video Tutorials
        {youtube_section}
        
        #### Books and Articles
        1. **"Mock Book Title 1"** - A comprehensive guide to {subField}.
        2. **"Mock Book Title 2"** - Advanced techniques in {subField}.
        3. **"Mock Article Title"** - Recent developments in {subField}.
        
        ### Practice Questions and Detailed Answers
        <div class='qa-section'>
        1. <div class='question'>Mock question 1?</div>
           <div class='answer'>Mock answer 1 with detailed explanation.</div>
        
        2. <div class='question'>Mock question 2?</div>
           <div class='answer'>Mock answer 2 with code examples.</div>
        
        3. <div class='question'>Mock question 3?</div>
           <div class='answer'>Mock answer 3 with thorough explanation.</div>
        
        4. <div class='question'>Mock question 4?</div>
           <div class='answer'>Mock answer 4 with best practices.</div>
        
        5. <div class='question'>Mock question 5?</div>
           <div class='answer'>Mock answer 5 with advanced concepts.</div>
        </div>
        """
        return markdown_to_html(mock_content)

    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": dynamic_prompt},
                {"role": "user", "content": "Please generate the requested content for me."}
            ],
            model="llama3-8b-8192",
            temperature=0.7,
            max_tokens=6000,
            top_p=1,
            stop=None,
            stream=False,
        )
        
        markdown_response = chat_completion.choices[0].message.content
        html_response = markdown_to_html(markdown_response)
        return html_response
    except Exception as e:
        print(f"Error generating model response: {e}")
        return f"<p>Error generating content: {str(e)}</p>"

@app.route('/generate_prompt', methods=['POST'])
def handle_generate_prompt():
    data = request.json
    mainField = data.get('mainField', '')
    subField = data.get('subField', '')
    difficulty = data.get('difficulty', '')
    
    generated_content = generate_model_response(mainField, subField, difficulty)
    
    return jsonify({
        'generated_content': generated_content
    })

if __name__ == '__main__':
    app.run(debug=True)
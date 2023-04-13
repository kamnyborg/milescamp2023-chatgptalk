using Newtonsoft.Json;
using System.Net.Http.Headers;

namespace chatgpt_proxy.External
{
    public class ChatGptApi : IChatGptApi
    {
        private readonly HttpClient _httpClient;
        private readonly List<Message> _messages;

        public ChatGptApi(IConfiguration config)
        {
            _httpClient = new HttpClient
            {
                BaseAddress = new("https://api.openai.com/v1/"),
            };

            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", config["ChatpGptApiKey"]);

            _messages = new List<Message>
            {
                new Message
                {
                    Content = "You are helpful co-host at a workshop",
                    Role = "system"
                }
            };
        }

        public async Task<string?> TranscribeAudio(IFormFile file)
        {
            var request = new HttpRequestMessage(HttpMethod.Post, "audio/transcriptions");
            var requestContent = new MultipartFormDataContent
            {
                { new StreamContent(file.OpenReadStream()), "file", "test.mp3" },
                { new StringContent("whisper-1"), "model" },
                { new StringContent("The transcript is about a workshop where we talk about ChatGPT API and Whisper API"), "prompt" },
                { new StringContent("en"), "language" }
            };

            request.Content = requestContent;
            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();
            var responseMessage = await response.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<WhisperResponse>(responseMessage).Text;
        }

        public async Task<string> Chat(string message)
        {
            var request = new HttpRequestMessage(HttpMethod.Post, "chat/completions");

            _messages.Add(new Message
            {
                Content = message,
                Role = "user"
            });

            var requestData = new ChatRequest
            {
                Model = "gpt-3.5-turbo",
                Messages = _messages.ToArray(),
                // max_tokens = maxTokens,
                // temperature = temperature
            };

            var requestContent = new StringContent(JsonConvert.SerializeObject(requestData));
            requestContent.Headers.ContentType = new MediaTypeHeaderValue("application/json");

            request.Content = requestContent;

            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            var responseContent = await response.Content.ReadAsStringAsync();
            var responseMessage = JsonConvert.DeserializeObject<ChatResponse>(responseContent).Choices.LastOrDefault().Message.Content;

            _messages.Add(new Message
            {
                Content = responseMessage,
                Role = "assistant"
            });

            return responseMessage;
        }
    }
}

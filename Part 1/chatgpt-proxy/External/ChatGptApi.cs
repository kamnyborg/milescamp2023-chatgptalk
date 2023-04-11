using Newtonsoft.Json;
using System.Net.Http.Headers;

namespace chatgpt_proxy.External
{
    public class ChatGptApi : IChatGptApi
    {
        private readonly HttpClient _httpClient;

        public ChatGptApi(IConfiguration config)
        {
            _httpClient = new HttpClient
            {
                BaseAddress = new("https://api.openai.com/v1/"),
            };

            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", config["ChatpGptApiKey"]);
        }

        public async Task<string> Chat(string message)
        {
            var request = new HttpRequestMessage(HttpMethod.Post, "chat/completions");

            var requestData = new ChatRequest
            {
                Model = "gpt-3.5-turbo",
                Messages = new Message[] {
                        new Message
                        {
                            Content = message,
                            Role = "user"
                        }
                    }
            };

            var requestContent = new StringContent(JsonConvert.SerializeObject(requestData));
            requestContent.Headers.ContentType = new MediaTypeHeaderValue("application/json");

            request.Content = requestContent;

            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();
            var responseMessage = await response.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<ChatResponse>(responseMessage).Choices.LastOrDefault().Message.Content;
        }
    }
}

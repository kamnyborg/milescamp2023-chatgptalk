using Newtonsoft.Json;

namespace chatgpt_proxy.External
{
    public class ChatRequest
    {
        [JsonProperty("model")]
        public string Model { get; set; }

        [JsonProperty("messages")]
        public Message[] Messages { get; set; }

        [JsonProperty("temperature")]
        public double Temperature { get; set; }
    }
}

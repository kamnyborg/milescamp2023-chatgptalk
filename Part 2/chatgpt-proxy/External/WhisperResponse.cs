using Newtonsoft.Json;

namespace chatgpt_proxy.External
{
    public partial class WhisperResponse
    {
        [JsonProperty("text")]
        public string Text { get; set; }
    }
}

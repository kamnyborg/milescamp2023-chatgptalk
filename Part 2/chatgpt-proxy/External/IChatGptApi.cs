namespace chatgpt_proxy.External
{
    public interface IChatGptApi
    {
        Task<string> Chat(string message);
        Task<string?> TranscribeAudio(IFormFile file);
    }
}
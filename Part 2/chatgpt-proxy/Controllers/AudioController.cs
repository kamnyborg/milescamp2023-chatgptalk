using chatgpt_proxy.External;
using Microsoft.AspNetCore.Mvc;

namespace chatgpt_proxy.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AudioController : ControllerBase
    {
        private readonly IChatGptApi _chatGptApi;

        public AudioController(IChatGptApi chatGptApi)
        {
            _chatGptApi = chatGptApi;
        }

        [HttpPost]
        public async Task<string?> Transcribe(IFormFile file)
        {
            return await _chatGptApi.TranscribeAudio(file);
        }
    }
}

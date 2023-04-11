using chatgpt_proxy.External;
using Microsoft.AspNetCore.Mvc;

namespace chatgpt_proxy.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MessageController : ControllerBase
    {
        private readonly IChatGptApi _chatGptApi;

        public MessageController(IChatGptApi chatGptApi)
        {
            _chatGptApi = chatGptApi;
        }

        [HttpPost]
        public async Task<string> Chat(string message)
        {
            return await _chatGptApi.Chat(message);
        }
    }
}

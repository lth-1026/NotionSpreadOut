document.getElementById("readDOM").addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
    // 현재 탭에 메시지 보내기
    chrome.tabs.sendMessage(tab.id, { action: "readDOM" }, (response) => {
        if (chrome.runtime.lastError) {
            document.getElementById("output").innerText = "Failed to read DOM.";
            return;
        }

        // 결과 표시
        document.getElementById("output").innerHTML = response.data;
        document.getElementById('output').insertAdjacentHTML('afterend', response.data);
    });
});
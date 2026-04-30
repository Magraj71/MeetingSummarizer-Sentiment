async function test() {
  const transcript = "John: We need to finalize the budget. Sarah: I agree. Let's aim for $50k.";
  const res = await fetch("http://localhost:3000/api/summarize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transcript })
  });
  const data = await res.json();
  console.log(data);
}
test();

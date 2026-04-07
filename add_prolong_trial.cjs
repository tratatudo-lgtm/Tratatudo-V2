const fs = require("fs");

const path = "/home/ubuntu/Tratatudo-V2/server.ts";
let code = fs.readFileSync(path, "utf-8");

if (code.includes("prolong-trial")) {
  console.log("Já existe");
  process.exit(0);
}

const endpoint = `

app.post("/api/admin/clients/:id/prolong-trial", async (req, res) => {
  try {
    const id = req.params.id;
    const days = Number(req.body.days || 0);

    if (!days) return res.status(400).json({ ok:false });

    const { data } = await supabase
      .from("clients")
      .select("trial_end")
      .eq("id", id)
      .single();

    const base = data?.trial_end ? new Date(data.trial_end) : new Date();
    base.setDate(base.getDate() + days);

    await supabase
      .from("clients")
      .update({ trial_end: base.toISOString() })
      .eq("id", id);

    res.json({ ok:true });

  } catch(e){
    console.log(e);
    res.status(500).json({ ok:false });
  }
});
`;

code = code.replace("app.listen", endpoint + "\napp.listen");

fs.writeFileSync(path, code);

console.log("OK");

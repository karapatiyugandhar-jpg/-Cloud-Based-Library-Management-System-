const KEY = "cloudLibraryData_v1";

const demoData = {
  books: [
    {id:"B001", title:"Clean Code", author:"Robert C. Martin", isbn:"9780132350884", category:"Programming", year:"2008", copies:4, available:3},
    {id:"B002", title:"The Pragmatic Programmer", author:"David Thomas", isbn:"9780135957059", category:"Programming", year:"2019", copies:3, available:2},
    {id:"B003", title:"Atomic Habits", author:"James Clear", isbn:"9780735211292", category:"Self Help", year:"2018", copies:5, available:5},
    {id:"B004", title:"Introduction to Algorithms", author:"Thomas H. Cormen", isbn:"9780262046305", category:"Computer Science", year:"2022", copies:2, available:1},
    {id:"B005", title:"Artificial Intelligence", author:"Stuart Russell", isbn:"9780134610993", category:"Artificial Intelligence", year:"2021", copies:3, available:3}
  ],
  members: [
    {id:"M001", name:"Rahul Kumar", email:"rahul@example.com", phone:"9876543210", course:"B.Tech CSE", joined:"2026-06-12"},
    {id:"M002", name:"Priya Sharma", email:"priya@example.com", phone:"9876501234", course:"B.Tech IT", joined:"2026-07-05"},
    {id:"M003", name:"Arjun Reddy", email:"arjun@example.com", phone:"9988776655", course:"BCA", joined:"2026-08-20"}
  ],
  transactions: [
    {id:"T001", bookId:"B001", memberId:"M001", issueDate:"2026-09-20", dueDate:"2026-10-04", returnDate:"", status:"Issued"},
    {id:"T002", bookId:"B002", memberId:"M002", issueDate:"2026-09-12", dueDate:"2026-09-26", returnDate:"2026-09-24", status:"Returned"},
    {id:"T003", bookId:"B004", memberId:"M003", issueDate:"2026-10-01", dueDate:"2026-10-15", returnDate:"", status:"Issued"}
  ]
};

let data = loadData();

function loadData(){
  try { return JSON.parse(localStorage.getItem(KEY)) || structuredClone(demoData); }
  catch(e){ return structuredClone(demoData); }
}
function save(){ localStorage.setItem(KEY, JSON.stringify(data)); renderAll(); }
function esc(v){ return String(v ?? "").replace(/[&<>"']/g, m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m])); }
function today(){ return new Date().toISOString().slice(0,10); }
function nextId(prefix, arr){ return prefix + String(arr.length + 1).padStart(3,"0"); }
function bookName(id){ return data.books.find(x=>x.id===id)?.title || "Unknown"; }
function memberName(id){ return data.members.find(x=>x.id===id)?.name || "Unknown"; }
function toast(msg){ const t=document.getElementById("toast"); t.textContent=msg; t.classList.add("show"); setTimeout(()=>t.classList.remove("show"),2200); }

document.querySelectorAll(".nav-item").forEach(btn=>btn.addEventListener("click",()=>showSection(btn.dataset.section)));
document.querySelectorAll("[data-go]").forEach(btn=>btn.addEventListener("click",()=>showSection(btn.dataset.go)));

function showSection(id){
  document.querySelectorAll(".section").forEach(s=>s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  document.querySelectorAll(".nav-item").forEach(n=>n.classList.toggle("active",n.dataset.section===id));
  const titles={dashboard:"Dashboard",books:"Books",members:"Members",transactions:"Transactions",reports:"Reports"};
  document.getElementById("pageTitle").textContent=titles[id];
  window.scrollTo({top:0,behavior:"smooth"});
}

function renderAll(){
  renderDashboard(); renderBooks(); renderMembers(); renderTransactions(); renderReports(); populateCategoryFilter();
}

function renderDashboard(){
  const total=data.books.reduce((s,b)=>s+b.copies,0);
  const available=data.books.reduce((s,b)=>s+b.available,0);
  const issued=total-available;
  document.getElementById("totalBooks").textContent=total;
  document.getElementById("availableBooks").textContent=available;
  document.getElementById("issuedBooks").textContent=issued;
  document.getElementById("totalMembers").textContent=data.members.length;

  const recent=[...data.transactions].reverse().slice(0,5);
  document.getElementById("recentTransactions").innerHTML=recent.length?`<table class="data-table"><thead><tr><th>Book</th><th>Member</th><th>Date</th><th>Status</th></tr></thead><tbody>${recent.map(t=>`<tr><td>${esc(bookName(t.bookId))}</td><td>${esc(memberName(t.memberId))}</td><td>${t.issueDate}</td><td><span class="badge ${t.status.toLowerCase()}">${t.status}</span></td></tr>`).join("")}</tbody></table>`:`<div class="empty">No transactions yet.</div>`;

  const popularity={}; data.transactions.forEach(t=>popularity[t.bookId]=(popularity[t.bookId]||0)+1);
  const popular=data.books.map(b=>({...b,n:popularity[b.id]||0})).sort((a,b)=>b.n-a.n).slice(0,5);
  document.getElementById("popularBooks").innerHTML=popular.map(b=>`<div class="book-row"><div class="book-info"><strong>${esc(b.title)}</strong><small>${esc(b.author)}</small></div><span class="count">${b.n} loan${b.n===1?"":"s"}</span></div>`).join("");
}

function renderBooks(){
  const q=(document.getElementById("bookSearch")?.value||"").toLowerCase();
  const cat=document.getElementById("bookCategoryFilter")?.value||"";
  const list=data.books.filter(b=>(!cat||b.category===cat)&&[b.title,b.author,b.isbn,b.category,b.id].join(" ").toLowerCase().includes(q));
  document.getElementById("booksTable").innerHTML=list.length?`<table class="data-table"><thead><tr><th>ID</th><th>Title</th><th>Author</th><th>Category</th><th>ISBN</th><th>Copies</th><th>Available</th><th>Actions</th></tr></thead><tbody>${list.map(b=>`<tr><td>${b.id}</td><td><strong>${esc(b.title)}</strong></td><td>${esc(b.author)}</td><td>${esc(b.category)}</td><td>${esc(b.isbn)}</td><td>${b.copies}</td><td><span class="badge ${b.available?"available":"overdue"}">${b.available}</span></td><td><button class="action-btn" onclick="editBook('${b.id}')">Edit</button><button class="action-btn delete" onclick="deleteBook('${b.id}')">Delete</button></td></tr>`).join("")}</tbody></table>`:`<div class="empty">No books found.</div>`;
}
function populateCategoryFilter(){
  const sel=document.getElementById("bookCategoryFilter"); const current=sel.value;
  const cats=[...new Set(data.books.map(b=>b.category))].sort();
  sel.innerHTML='<option value="">All Categories</option>'+cats.map(c=>`<option>${esc(c)}</option>`).join("");
  sel.value=cats.includes(current)?current:"";
}
document.getElementById("bookSearch").addEventListener("input",renderBooks);
document.getElementById("bookCategoryFilter").addEventListener("change",renderBooks);

function renderMembers(){
  const q=(document.getElementById("memberSearch")?.value||"").toLowerCase();
  const list=data.members.filter(m=>[m.id,m.name,m.email,m.phone,m.course].join(" ").toLowerCase().includes(q));
  document.getElementById("membersTable").innerHTML=list.length?`<table class="data-table"><thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Course</th><th>Joined</th><th>Actions</th></tr></thead><tbody>${list.map(m=>`<tr><td>${m.id}</td><td><strong>${esc(m.name)}</strong></td><td>${esc(m.email)}</td><td>${esc(m.phone)}</td><td>${esc(m.course)}</td><td>${m.joined}</td><td><button class="action-btn" onclick="editMember('${m.id}')">Edit</button><button class="action-btn delete" onclick="deleteMember('${m.id}')">Delete</button></td></tr>`).join("")}</tbody></table>`:`<div class="empty">No members found.</div>`;
}
document.getElementById("memberSearch").addEventListener("input",renderMembers);

function renderTransactions(){
  const q=(document.getElementById("transactionSearch")?.value||"").toLowerCase();
  const f=document.getElementById("transactionFilter")?.value||"";
  const list=data.transactions.filter(t=>(!f||t.status===f)&&[t.id,bookName(t.bookId),memberName(t.memberId),t.issueDate,t.dueDate,t.status].join(" ").toLowerCase().includes(q));
  document.getElementById("transactionsTable").innerHTML=list.length?`<table class="data-table"><thead><tr><th>ID</th><th>Book</th><th>Member</th><th>Issue Date</th><th>Due Date</th><th>Return Date</th><th>Status</th><th>Action</th></tr></thead><tbody>${list.map(t=>{
    const late=t.status==="Issued"&&t.dueDate<today();
    return `<tr><td>${t.id}</td><td>${esc(bookName(t.bookId))}</td><td>${esc(memberName(t.memberId))}</td><td>${t.issueDate}</td><td>${t.dueDate}</td><td>${t.returnDate||"-"}</td><td><span class="badge ${late?"overdue":t.status.toLowerCase()}">${late?"Overdue":t.status}</span></td><td>${t.status==="Issued"?`<button class="action-btn" onclick="returnBook('${t.id}')">Return</button>`:"—"}</td></tr>`;
  }).join("")}</tbody></table>`:`<div class="empty">No transactions found.</div>`;
}
document.getElementById("transactionSearch").addEventListener("input",renderTransactions);
document.getElementById("transactionFilter").addEventListener("change",renderTransactions);

function renderReports(){
  const total=data.books.reduce((s,b)=>s+b.copies,0);
  const loans=data.transactions.filter(t=>t.status==="Issued").length;
  const overdue=data.transactions.filter(t=>t.status==="Issued"&&t.dueDate<today()).length;
  document.getElementById("reportBooks").textContent=total;
  document.getElementById("reportLoans").textContent=loans;
  document.getElementById("reportMembers").textContent=data.members.length;
  document.getElementById("reportOverdue").textContent=overdue;
  const groups={}; data.books.forEach(b=>groups[b.category]=(groups[b.category]||0)+b.copies);
  const max=Math.max(...Object.values(groups),1);
  document.getElementById("categoryReport").innerHTML=Object.entries(groups).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class="bar-row"><span>${esc(k)}</span><div class="bar"><i style="width:${v/max*100}%"></i></div><strong>${v}</strong></div>`).join("")||'<div class="empty">No categories yet.</div>';
}

const modal=document.getElementById("modal");
function openModal(title,html,onSubmit){
  document.getElementById("modalTitle").textContent=title;
  document.getElementById("modalForm").innerHTML=html;
  modal.classList.remove("hidden");
  document.getElementById("modalForm").onsubmit=e=>{e.preventDefault();onSubmit(new FormData(e.target));};
}
function closeModal(){modal.classList.add("hidden")}
document.getElementById("closeModal").onclick=closeModal;
modal.addEventListener("click",e=>{if(e.target===modal)closeModal()});

document.getElementById("addBookBtn").onclick=()=>openBookForm();
function openBookForm(id=null){
  const b=id?data.books.find(x=>x.id===id):null;
  openModal(id?"Edit Book":"Add Book",`<div class="form-grid">
    <div class="field"><label>Book ID</label><input name="id" value="${b?.id||nextId("B",data.books)}" required ${id?"readonly":""}></div>
    <div class="field"><label>Title</label><input name="title" value="${esc(b?.title||"")}" required></div>
    <div class="field"><label>Author</label><input name="author" value="${esc(b?.author||"")}" required></div>
    <div class="field"><label>ISBN</label><input name="isbn" value="${esc(b?.isbn||"")}" required></div>
    <div class="field"><label>Category</label><input name="category" value="${esc(b?.category||"")}" required></div>
    <div class="field"><label>Year</label><input name="year" type="number" value="${b?.year||new Date().getFullYear()}" required></div>
    <div class="field"><label>Total Copies</label><input name="copies" type="number" min="1" value="${b?.copies||1}" required></div>
  </div><div class="form-actions"><button type="button" class="secondary-btn" onclick="closeModal()">Cancel</button><button class="primary-btn">Save Book</button></div>`,f=>{
    const o=Object.fromEntries(f.entries()); o.copies=+o.copies; o.year=o.year;
    if(id){const old=data.books.find(x=>x.id===id); const issued=old.copies-old.available; if(o.copies<issued){toast("Total copies cannot be less than issued copies");return} old.title=o.title;old.author=o.author;old.isbn=o.isbn;old.category=o.category;old.year=o.year;old.copies=o.copies;old.available=o.copies-issued;toast("Book updated");}
    else {o.available=o.copies;data.books.push(o);toast("Book added")}
    save();closeModal();
  });
}
window.editBook=openBookForm;
window.deleteBook=id=>{if(data.transactions.some(t=>t.bookId===id&&t.status==="Issued")){toast("Cannot delete a book that is currently issued");return} if(confirm("Delete this book?")){data.books=data.books.filter(b=>b.id!==id);save();toast("Book deleted")}};

document.getElementById("addMemberBtn").onclick=()=>openMemberForm();
function openMemberForm(id=null){
  const m=id?data.members.find(x=>x.id===id):null;
  openModal(id?"Edit Member":"Add Member",`<div class="form-grid">
    <div class="field"><label>Member ID</label><input name="id" value="${m?.id||nextId("M",data.members)}" required ${id?"readonly":""}></div>
    <div class="field"><label>Full Name</label><input name="name" value="${esc(m?.name||"")}" required></div>
    <div class="field"><label>Email</label><input name="email" type="email" value="${esc(m?.email||"")}" required></div>
    <div class="field"><label>Phone</label><input name="phone" value="${esc(m?.phone||"")}" required></div>
    <div class="field full"><label>Course / Department</label><input name="course" value="${esc(m?.course||"")}" required></div>
  </div><div class="form-actions"><button type="button" class="secondary-btn" onclick="closeModal()">Cancel</button><button class="primary-btn">Save Member</button></div>`,f=>{
    const o=Object.fromEntries(f.entries()); o.joined=m?.joined||today();
    if(id)Object.assign(m,o); else data.members.push(o);
    save();closeModal();toast(id?"Member updated":"Member added");
  });
}
window.editMember=openMemberForm;
window.deleteMember=id=>{if(data.transactions.some(t=>t.memberId===id&&t.status==="Issued")){toast("Member has an active loan");return} if(confirm("Delete this member?")){data.members=data.members.filter(m=>m.id!==id);save();toast("Member deleted")}};

document.getElementById("issueBookBtn").onclick=()=>{
  const available=data.books.filter(b=>b.available>0);
  if(!available.length){toast("No books are currently available");return}
  if(!data.members.length){toast("Add a member first");return}
  openModal("Issue Book",`<div class="form-grid">
    <div class="field full"><label>Book</label><select name="bookId" required>${available.map(b=>`<option value="${b.id}">${esc(b.title)} (${b.available} available)</option>`).join("")}</select></div>
    <div class="field full"><label>Member</label><select name="memberId" required>${data.members.map(m=>`<option value="${m.id}">${esc(m.name)} - ${m.id}</option>`).join("")}</select></div>
    <div class="field"><label>Issue Date</label><input name="issueDate" type="date" value="${today()}" required></div>
    <div class="field"><label>Due Date</label><input name="dueDate" type="date" value="${new Date(Date.now()+14*86400000).toISOString().slice(0,10)}" required></div>
  </div><div class="form-actions"><button type="button" class="secondary-btn" onclick="closeModal()">Cancel</button><button class="primary-btn">Issue Book</button></div>`,f=>{
    const o=Object.fromEntries(f.entries()); const b=data.books.find(x=>x.id===o.bookId); b.available--;
    data.transactions.push({id:nextId("T",data.transactions),...o,returnDate:"",status:"Issued"}); save();closeModal();toast("Book issued successfully");
  });
};
window.returnBook=id=>{
  const t=data.transactions.find(x=>x.id===id); if(!t)return;
  const b=data.books.find(x=>x.id===t.bookId); if(b)b.available++;
  t.returnDate=today();t.status="Returned";save();toast("Book returned successfully");
};

document.getElementById("resetData").onclick=()=>{if(confirm("Reset all data to the original demo data?")){data=structuredClone(demoData);save();toast("Demo data restored")}};

renderAll();

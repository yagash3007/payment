let globaldata = []; // Initialize globaldata as an empty array
document.addEventListener('DOMContentLoaded', (event) => {
  $("#payment_ids").select2();  
});


console.log(globaldata); // This will log an empty array initially
let dates = document.getElementById("datepicker");
console.log(dates);
var myid=(domo.env).userId;


domo.get(`/domo/users/v1/${myid}?includeDetails=true`).then(function(data){
  console.log("myinfo",data)
 
})


var myname='';
let d1 = new Date();
    let current = d1.toISOString().slice(0, 10);
    dates.min = current;
    console.log(dates);

    domo.get("/domo/users/v1?includeDetails=true&limit=200")
  .then(function (data) {
    // Inside this function, 'data' will contain the fetched user data
    globaldata = data; // Assign fetched data to globaldata
    console.log(globaldata);

    // Iterate over each user in 'data'
    data.forEach((user) => {
      let id = user.id;
      let email = user.detail.email;
      let name = user.displayName;

      let HTML = `<option id="${name}" onclick="handle(${id})" value="${email}">${name}</option>`;

      let list1 = document.getElementById("payment_ids");
      list1.innerHTML += HTML;
    });
    



    domo.get("/domo/users/v1?includeDetails=true&limit=200").then(function (data){
      console.log(data)
  
      data.forEach(element => {
        if(myid==element.id){
           console.log(element.displayName)
           myname=element.displayName;
  
        }
       
        
      });
    })
  })
  .catch(function (error) {
    console.error("Error fetching user data:", error);
  });

//console.log(globaldata);

function handle(id) {

  let list1 = document.getElementById("payment_ids");
  let list2 = list1.value;
  console.log(list2);

  let user = globaldata.find((user) => user.detail.email === list2);
  console.log(globaldata);

  let name = user.displayName;
  let email = user.detail.email;

  document.getElementById("name").value = name;
  document.getElementById("email").value = email;


}


    
//send email

function SendEmail() {
  let to = document.getElementById("email").value;
  let name = document.getElementById("name").value;
  let company = document.getElementById("company").value;
  let amount = document.getElementById("amount").value;
  let date = document.getElementById("datepicker").value;
  let cur=document.getElementById("currency").value;
  console.log(cur);
  
  // var myname='';
  // domo.get("/domo/users/v1?includeDetails=true&limit=200").then(function (data){
  //   console.log(data)

  //   data.forEach(element => {
  //     if(myid==element.id){
  //        console.log(element.displayName)
  //        myname=element.displayName;

  //     }
     
      
  //   });
  // })

  let html_content = `<!DOCTYPE html>

    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Content</title>
        <style>
          
        </style>
    </head>
    <body>
        <p>Hello ${name},</p>
        <p>${company} requested ${amount} ${cur} payment.</p>
        <p>you need payment before <u>${date}</u></p>
        <p>
        <br>Thanks<br>${myname} <br>
        </p>
    </body>
    </html>`

  console.log("Sending Email to ====>", to);
  const startWorkflow = (alias, data) => {
    return new Promise((resolve, reject) => {
        domo.post(`/domo/workflow/v1/models/${alias}/start`, data)
            .then((response) => {
                console.log("Workflow started successfully:", response);
                resolve(response);

                // Retrieve form field values
               
            })
            .catch((error) => {
                console.error("Error starting workflow:", error);
                reject(error); // Reject with error
            });
    });
};

  // Adjust the workflow alias and data structure according to your actual implementation
  startWorkflow("send_email", {
    to: to,
    subject: `Payment Request from ${company}`,
    body: html_content,
  })
    .then((response) => {
      console.log("Email sent successfully.");
      let id = document.getElementById("name").value;
      let email = document.getElementById("email").value;
      let amount = document.getElementById("amount").value;
      let date = document.getElementById("datepicker").value;
      let na = document.getElementById("name").value;
      let company = document.getElementById("company").value;
        let myid =domo.env.userId



      // Construct `a` object with conditional fallbacks
      const a = {
          content: {
            requested_by:{
              name: myname ? `${myname}` : "dummy",
              user_id: myid  ? `${myid}` : "dummy",
          },
              requested_to: {
                  user_id: id ? `${id}` : "dummy",
                  name: na ? `${na}` : "dummy",
                  user_email: email ? `${email}` : "dummy",
              },
              contact_details: {
                  name: na ? `${na}` : "dummy",
                  email: email ? `${email}` : "dummy",
              },
              request_details: {
                  amount: {
                      currency: "INR",
                      amount: amount ? `${amount}` : "dummy",
                      due_date: date ? `${date}` : "dummy",
                  },
              },
              company_name: company ? `${company}` : "dummy",
              destination_account: "82179493898294",
          },
      };

      // Post `a` to datastore collection
      domo.post(`/domo/datastores/v1/collections/request_form/documents/`, a)
          .then((data) => {
              console.log("Data posted successfully:", data);
          })
          .catch((error) => {
              console.error("Error posting data to datastore:", error);
              reject(error); // Reject with error
          });

      //document.getElementById("test").textContent = "True"; // Update UI or indicate success

    })
    .catch((error) => {
      console.error("Error sending email:", error);
      // Handle error as needed, e.g., display an error message to the user
    });
}

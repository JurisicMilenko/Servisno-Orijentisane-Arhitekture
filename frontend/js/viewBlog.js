const API_BASE = window.API_BASE || 'http://localhost:4000';
const BLOG_BASE = window.BLOG_BASE || 'http://localhost:5065';
const STAKEHOLDERS_BASE = window.STAKEHOLDERS_BASE || 'http://localhost:3001';

const token = localStorage.getItem('token');

if (!token) {
  window.location.href = './index.html';
}

console.log('[createBlog.js] Token found');

// Navigation
const homeBtn = document.getElementById('homeBtn');
const profileBtn = document.getElementById('profileBtn');
const logoutBtn = document.getElementById('logoutBtn');
const cancelBtn = document.getElementById('cancelBtn');

homeBtn?.addEventListener('click', () => {
  const ts = Date.now();
  window.location.href = `./home.html?v=${ts}`;
});

profileBtn?.addEventListener('click', () => {
  const ts = Date.now();
  window.location.href = `./userDetails.html?v=${ts}`;
});

logoutBtn?.addEventListener('click', () => {
  localStorage.removeItem('token');
  const ts = Date.now();
  window.location.href = `./index.html?v=${ts}`;
});

function create(htmlStr) {
    var frag = document.createDocumentFragment(),
        temp = document.createElement('div');
    temp.innerHTML = htmlStr;
    while (temp.firstChild) {
        frag.appendChild(temp.firstChild);
    }
    return frag;
}


window.onload = async function() {
  alert("????")
    const res = await fetch(`${BLOG_BASE}/api/touristOrAuthor/blog`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const data = await res.json();

    /*const res2 = await fetch(`${API_BASE}/api/followers/me/following?userId=${user.id}`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const data2 = await res2.json();*/
   for(var i in data.results){
    var image = await getImage(data.results[i])
    var username = await getUsername(data.results[i]);
    var htmltags = '<div><h2>Title: '+data.results[i].title+'</h2><p>Description: '+data.results[i].description+'</p><p>Creator: '+username+'</p>'+
        '<p>Date: '+data.results[i].createdAt+'</p><p>Likes: '+await numberOfLikes(data.results[i].id)+'</p><img id="profileImg" src="'+image+'" alt="Avatar" /><br><button onclick="Like('+ data.results[i].id +')" class="btn btn-primary">Like</button><br>';
    htmltags = htmltags + await addComments(data.results[i])

        htmltags = htmltags + '<form id="createBlogForm">'+
        '<label>Text<br><input type="text" id="text'+data.results[i].id+'" name="text" required></label><br>'+
          '<button type="submit"  onclick="uploadComment('+data.results[i].id+'); return false;" class="btn btn-primary">Submit</button>'+
        '</div>'+
      '</form></div>'    
        var fragment = create(htmltags);
    document.body.insertBefore(fragment, document.body.childNodes[-1]);
   }
    
// You can use native DOM methods to insert the fragment:
    
};

async function getUsername(blog){
    const res = await fetch(`${STAKEHOLDERS_BASE}/api/stakeholders/users`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const data = await res.json();

    
    for(var i in data){
       //alert(data[i].username)
       //alert(blog.userId + " and "+ data[i].id)
       if(blog.userId == data[i].id){
        //alert(data[i].username)
        return data[i].username
       }
    }
    
    return "idk";

};

async function getImage(blog){
    const res = await fetch(`${BLOG_BASE}/api/touristOrAuthor/blog/blogDetails/`+blog.id, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const data = await res.json();
    //alert(data.pictures[0].data)
    return data.pictures[0].data;
};

async function Like(id) {

    const res = await fetch(`${BLOG_BASE}/api/blogratings`, {
      headers: {
        'Authorization': 'Bearer ' + token,
      },
    });
    const data = await res.json();
    const res1 = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const data1 = await res1.json();
    var found = 0
    var rating
    for(var i in data.results){
        //alert(blog.ratings[i].userId +" "+ data1.id)
        if(data.results[i].userId == data1.id){
            found = 1
            
            //for(var key in data.ratings[i]){
            //alert(key);
            //}
            rating = data.results[i].id
            alert(rating)
        }
    }
    if(found == 0){
    const body = {
    id: 0,
    blogId: id,
    voteType: 0,
    userId: data1.id
  };


        const res = await fetch(`${BLOG_BASE}/api/blogratings`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    /*data.ratings.push(body)
    const res1 = await fetch(`${BLOG_BASE}/api/touristOrAuthor/blog/`+id, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
*/

    }else{

        alert("found")

        const res = await fetch(`${BLOG_BASE}/api/blogratings/`+rating+"?id="+rating, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
    });

    /*data.ratings = data.ratings.filter(rating1 => rating1.userId !== data1.id);
    const res1 = await fetch(`${BLOG_BASE}/api/touristOrAuthor/blog/`+id, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });*/


    }

}

async function numberOfLikes(blogId){

    const res = await fetch(`${BLOG_BASE}/api/blogratings`, {
      headers: {
        'Authorization': 'Bearer ' + token,
      },
    });
    const data = await res.json();
    var likes = 0
    for(var i in data.results){
        if(data.results[i].blogId == blogId){
            likes += 1
        }
    }
    return likes;
}

async function addComments(blog){
    const res = await fetch(`${BLOG_BASE}/api/touristOrAuthor/comment`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const data = await res.json();
    var commentString = '<h4>Comments:</h4><br>'
    for(var i in data.results){
        if(data.results[i].blogId == blog.id){
            var username = await getUsername(data.results[i]);
            commentString = commentString+'<p>User: '+ username +'</p><br><p>Date: '+data.results[i].creationDate+'</p><br><p>Text: '+data.results[i].text+'</p><br>'
        }
    }
    return commentString;
}

async function uploadComment(id){
    const res1 = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const data1 = await res1.json();
    var elId = 'text' + id
    var text = document.getElementById(elId);
    const body = {
    id: 0,
    blogId: id,
    creationDate: new Date(),
    updateDate: new Date(),
    text: text.value,
    userId: data1.id
  };

  const res = await fetch(`${BLOG_BASE}/api/touristOrAuthor/comment`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

}
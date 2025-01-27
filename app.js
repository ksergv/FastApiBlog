// frontend/app.js


Vue.component('register-form', {
    template: `
        <div>
            <h2>Регистрация</h2>
            <form @submit.prevent="register">
                <input type="text" v-model="registerData.username" placeholder="Имя пользователя" required>
                <input type="password" v-model="registerData.password" placeholder="Пароль" required>
                <input type="email" v-model="registerData.email" placeholder="Email (необязательно)">
                <button type="submit">Зарегистрироваться</button>
            </form>
            <p v-if="registerMessage">{{ registerMessage }}</p>
        </div>
    `,
    data() {
        return {
            registerData: {
                username: '',
                password: '',
                email: ''
            },
            registerMessage: ''
        };
    },
    methods: {
        async register() {
            try {
                const response = await fetch('https://fastapi-app-0tqo.onrender.com/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(this.registerData)
                });

                if (response.ok) {
                    this.registerMessage = 'Регистрация прошла успешно!';
                    this.registerData.username = '';
                    this.registerData.password = '';
                    this.registerData.email = '';
                } else {
                    const errorData = await response.json();
                    this.registerMessage = `Ошибка регистрации: ${errorData.detail}`;
                }
            } catch (error) {
                console.error('Error during registration:', error);
                this.registerMessage = 'Ошибка регистрации.';
            }
        }
    }
});
Vue.component('login-form', {
    template: `
        <div>
            <h2>Вход</h2>
            <form @submit.prevent="login">
                <input type="text" v-model="loginData.username" placeholder="Имя пользователя" required>
                <input type="password" v-model="loginData.password" placeholder="Пароль" required>
                 <input type="email" v-model="loginData.email" placeholder="e-mail(необязательно)" >
                <button type="submit">Войти</button>
            </form>
            <p v-if="loginMessage">{{ loginMessage }}</p>
        </div>
    `,
    data() {
        return {
            loginData: {
                username: '',
                password: '',
                email:''
            },
            loginMessage: ''
        };
    },
    methods: {
        async login() {
            try {
                const response = await fetch('https://fastapi-app-0tqo.onrender.com/token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        username: this.loginData.username,
                        password: this.loginData.password,
                        email: this.loginData.email
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                       // Debugging log to see the entire response
        console.log("Login Response Data:", data);

        // Check if user_id exists in the response
        console.log("User ID:", data.user_id);
                    localStorage.setItem('access_token', data.access_token);
                    localStorage.setItem('refresh_token', data.refresh_token);
                    localStorage.setItem('user_id', data.user_id); // Store user_id
                   
                    this.loginMessage = 'Успешный вход!';
                    this.$emit('login-success', data.access_token); // Уведомляем родительский компонент
                } else {
                    const errorData = await response.json();
                    this.loginMessage = `Ошибка входа: ${errorData.detail}`;
                }
            } catch (error) {
                console.error('Error during login:', error);
                this.loginMessage = 'Ошибка входа.';
            }
        }
    }
});



Vue.component('post-manager', {
    
    template: `
        <div>
            <div v-show="showPostForm">
                <h2>{{ isEditing ? 'Редактировать пост' : 'Создание поста' }}</h2></br></br>
                <form @submit.prevent="isEditing ? updatePost() : addPost()">
                    <input type="text" v-model="newPost.title" placeholder="Название поста" required>
                    <input type="text" v-model="newPost.category" placeholder="Категория" required>

                     <!-- CKEditor component for content -->
                    <label for="full_text">Редактируйте Ваш текст здесь</label></br>
           <textarea v-model="newPost.content" class="form-control" name="full_text" id="full_text"></textarea></br>

                    <input type="text" v-model="newPost.image" placeholder="URL изображения">
                    <button  type="submit">{{ isEditing ? 'Сохранить изменения' : 'Добавить пост' }}</button>
                </form>
            </div>
                <div class="posts">
                
        <!-- Сообщение об успешной операции записи или изменения поста-->
    <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
                    <!-- Post Filter -->
                   <div class="post-filter container">
        <p style="width:100px;margin: 0;"><img  src="img/ganesha.png" width="100px" alt="logo" /></p>
                    
    <span class="filter-item" :class="{ 'active-filter': filtedValue === 'all' }" data-filter="all" @click="filterPosts">All</span>
    <span class="filter-item" :class="{ 'active-filter': filtedValue === 'magic' }" data-filter="magic" @click="filterPosts">Магия</span>
    <span class="filter-item" :class="{ 'active-filter': filtedValue === 'gigong' }" data-filter="gigong" @click="filterPosts">Цигун</span>
    <span class="filter-item" :class="{ 'active-filter': filtedValue === 'info' }" data-filter="info" @click="filterPosts">Информация</span>
    <span class="filter-item" :class="{ 'active-filter': filtedValue === 'health' }" data-filter="health" @click="filterPosts">Здоровье</span>
    <span class="filter-item" :class="{ 'active-filter': filtedValue === 'games' }" data-filter="games" @click="filterPosts">Игры</span>
    <span class="filter-item" :class="{ 'active-filter': filtedValue === 'pdf' }" data-filter="pdf" @click="filterPosts">PDF</span>

    <button @click="togglePostForm" class="new-post-button">Новый пост</button>
    <p style="width:100px;margin: 0;"><img  src="img/ganesha.png" width="100px" alt="logo" /></p>
</div>
                <!-- Список постов -->

                    <ul style='margin-top:50px;' class="post-grid">
                        <li v-for="post in paginatedPosts" :key="post.id" :class="post.category">
                            <h3>{{ post.title }}</h3>
                            <img v-if="post.image" :src="post.image" alt="Изображение поста" class="post-image">
                            <p v-html="getExcerpt(post.content)"></p>
                            <br/><br/>
                            <hr>
                            <button class="button_green" @click="viewPost(post)">Посмотреть</button>
                            <button class="button_blue" @click.stop="editPost(post)">Редактировать</button>
                            <button class="button_red" @click.stop="deletePost(post.id)">Удалить</button>
                        </li>
                    </ul>
                    <!-- Pagination Controls -->
            <div class="pagination">
                <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1">Previous</button>
                
                <button v-for="page in  totalPages" 
                        :key="page" 
                        @click="changePage(page)" 
                        :class="{ active: currentPage === page }">
                    {{ page }}
                </button>

                <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages">Next</button>
            </div>


                     <!-- Post View -->
     <post-view v-if="selectedPost" :post="selectedPost"  ref="postView"   @close-post="selectedPost = null" 
     />
  
       </div> 
    </div>  
    `,

    props: ['token'],
    data() {
        return {
            showPostForm: false,
            newPost: {
                title: '',
                category: '',
                content: '',
                image: ''
            },
            posts: [],
            selectedPost: null,
            isEditing: false,
            editingPostId: null,
            currentPage: 1,  // Текущая страница
            postsPerPage: 6,  // Количество постов на одной странице
            filtedValue: 'all',  // Текущее значение фильтра (по умолчанию 'all')
            successMessage: null, // Сообщение об успешной операции
        };
    },
    computed: {
        filteredPosts() {
            if (this.filtedValue === 'all') {
                return this.posts;
            }
            return this.posts.filter(post => post.category === this.filtedValue);
        },
        paginatedPosts() {
            const start = (this.currentPage - 1) * this.postsPerPage;
            const end = start + this.postsPerPage;
            return this.filteredPosts.slice(start, end);
        },
        totalPages() {
            return Math.ceil(this.filteredPosts.length / this.postsPerPage);
        }
    },
   
    methods: {  
        initEditor() {
            this.$nextTick(() => {
                const editorElement = document.getElementById('full_text');
                if (editorElement) {
                    CKEDITOR.replace('full_text', {
                        uiColor: '#CCEAEE',
                        resize_enabled: true
                    });
    
                    // Синхронизация содержимого CKEditor с v-model
                    CKEDITOR.instances.full_text.on('change', () => {
                        this.newPost.content = CKEDITOR.instances.full_text.getData();
                    });
                } else {
                    console.error('Editor element not found!');
                }
            });
        },
        // Переключение формы добавления поста
        togglePostForm() {
            this.showPostForm = !this.showPostForm;
            this.isEditing = false;
        },
        
         // Фильтрация постов при выборе категории
         filterPosts(event) {
            this.filtedValue = event.currentTarget.getAttribute('data-filter');
            this.currentPage = 1;  // Сброс страницы при смене фильтра
        },
            // Метод для смены страницы
            changePage(page) {
                if (page >= 1 && page <= this.totalPages) {
                    this.currentPage = page;
                }
            },
        
        async refreshAccessToken() {
            const refreshToken = localStorage.getItem('refresh_token');
            if (!refreshToken) {
                console.error('No refresh token found. Redirecting to login.');
               alert('Токен не найден автоизуйтесь заново');
                return false;
            }       
            try {
                const response = await fetch('https://fastapi-app-0tqo.onrender.com/refresh', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        refresh_token: refreshToken  // Передаем refresh_token в теле запроса
                    })
                });
        
                if (response.ok) {
                    const data = await response.json();
                    // Сохраняем новый access_token
                    localStorage.setItem('access_token', data.access_token);
                    this.token = data.access_token;  // Обновляем токен в вашем приложении
                    return true;
                } else {
                    console.error('Failed to refresh token:', await response.json());
                    return false;
                }
            } catch (error) {
                console.error('Error refreshing token:', error);
                return false;
            }
        },
        

        async fetchPosts() {
            try {
                const response = await fetch('https://fastapi-app-0tqo.onrender.com/posts/', {
                    headers: {
                        'Authorization': `Bearer ${this.token}`
                    }
                });
                if (response.ok) {
                    this.posts = await response.json();     
                } else if (response.status === 401) {
                    // Если токен истек, пытаемся обновить его
              
                    const refreshSuccessful = await this.refreshAccessToken();
                    if (refreshSuccessful) {
                        console.error('Access token  обновлен!');
                        // Повторяем запрос с новым токеном
                        return this.fetchPosts();
                    } else {
                        console.error('Failed to refresh token. Redirecting to login.');
                        // Перенаправляем на страницу входа
                        alert('Токен не найден автоизуйтесь заново');  
                    }
                } else {
                    const errorData = await response.json();
                    console.error('Failed to fetch posts:', errorData.detail);
                }
            } catch (error) {
                console.error('Error fetching posts:', error);
            }
    
        },
         // Метод для очистки формы
    clearForm() {
        this.newPost = {
          title: '',
          category: '',
          content: '',
          image: ''
        };
        this.isEditing = false;
      },
      resetForm() {
        // Скрываем форму
        this.showPostForm = false;

        // Очищаем поля формы
        this.clearForm();

        // Показываем сообщение об успешной записи
        this.successMessage = 'Пост успешно добавлен!';

        // Убираем сообщение через несколько секунд
        setTimeout(() => {
            this.successMessage = null;
        }, 3000);
    },
        async addPost() {
            try {
                const response = await fetch('https://fastapi-app-0tqo.onrender.com/posts/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.token}`
                    },
                    body: JSON.stringify(this.newPost)
                });
                if (response.ok) {
                    const post = await response.json();
                    this.posts.push(post);
                    this.resetForm();
                 } else if (response.status === 401) {
                        // Если токен истек, пытаемся обновить его
                  
                        const refreshSuccessful = await this.refreshAccessToken();
                        if (refreshSuccessful) {
                            console.error('Access token  обновлен!');
                            // Повторяем запрос с новым токеном
                            return this.addPost();
                        }
                    }
                 else {
                    const errorData = await response.json();
                    console.error('Failed to add post:', errorData.detail);
                }
            } catch (error) {
                console.error('Error adding post:', error);
            }
        },
   
        async updatePost() {
            try {
                const response = await fetch(`https://fastapi-app-0tqo.onrender.com/posts/${this.editingPostId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.token}`
                    },
                    body: JSON.stringify(this.newPost)
                });
                if (response.ok) {
                    const updatedPost = await response.json();
                    const index = this.posts.findIndex(post => post.id === this.editingPostId);
                    if (index !== -1) {
                        Vue.set(this.posts, index, updatedPost);
                    }
                    this.resetForm();
                }else if (response.status === 401) {
                    // Если токен истек, пытаемся обновить его
              
                    const refreshSuccessful = await this.refreshAccessToken();
                    if (refreshSuccessful) {
                        console.error('Access token  обновлен!');
                        // Повторяем запрос с новым токеном
                        return this.updatePost();
                    }
                } 
                else {
                    const errorData = await response.json();
                    console.error('Failed to update post:', errorData.detail);
                }
            } catch (error) {
                console.error('Error updating post:', error);
            }
        },

           // Добавьте метод для начала редактирования и передачи данных в форму и CKEditor
editPost(post) {
    this.isEditing = true;
    this.editingPostId = post.id;
    this.newPost = {
        title: post.title,
        category: post.category,
        content: post.content,  // Это будет передано в CKEditor
        image: post.image
    };
    
    // Задаем содержимое CKEditor
    this.$nextTick(() => {
        if (CKEDITOR.instances.full_text) {
            CKEDITOR.instances.full_text.setData(this.newPost.content);  // Передаем контент в CKEditor
        }
    });
    
    this.showPostForm = true;  // Показываем форму для редактирования
},
        async deletePost(postId) {
            try {
                const response = await fetch(`https://fastapi-app-0tqo.onrender.com/posts/${postId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${this.token}`
                    }
                });
                if (response.ok) {
                    this.posts = this.posts.filter(post => post.id !== postId);
                    if (this.selectedPost && this.selectedPost.id === postId) {
                        this.selectedPost = null;
                    }         
                    else if (response.status === 401) {
                        // Если токен истек, пытаемся обновить его                  
                        const refreshSuccessful = await this.refreshAccessToken();
                        if (refreshSuccessful) {
                            console.error('Access token  обновлен!');
                            // Повторяем запрос с новым токеном
                            return this.deletePost(postId);
                        }
                    } 
                 else {
                    const errorData = await response.json();
                    console.error('Failed to delete post:', errorData.detail);
                }}
            } catch (error) {
                console.error('Error deleting post:', error);
            }
        },
        viewPost(post) {
            this.selectedPost = post;
      
            // Прокручиваем страницу после обновления DOM
            this.$nextTick(() => {
              const postViewElement = this.$refs.postView.$el;
              postViewElement.scrollIntoView({ behavior: "smooth" });
            });
          },
     
        getExcerpt(content) {
            return content.length > 200 ? content.slice(0, 200) + '...' : content;
        }
    },
    mounted() {
        this.initEditor();
        this.fetchPosts();
    }
  
    
});
 


Vue.component('post-view', {
    template: `
      <div class="post-view">
        <h2>{{ post.title }}</h2>
        <h3>Категория: {{ post.category }}</h3>
        <img v-if="post.image" :src="post.image" alt="Изображение поста" class="post-image">
        <p v-html="post.content"></p>
     <button @click="closePost">Закрыть</button>
        <!-- Comments Section -->
        <div class="comments-section">
          <h3>Комментарии</h3>
            <ol v-if="comments.length > 0">
            <li v-for="comment in comments" :key="comment.id">
                <!-- Display either the comment or the editing form -->
               <p v-if="editingCommentId !== comment.id">
                <strong>{{ comment.owner_username }}:</strong>
                <span v-html="comment.content"></span>
                </p>
                <!-- Режим редактирования комментария -->
                <div v-if="editingCommentId === comment.id">
                    <textarea v-model="newComment"></textarea>
                    <button @click="submitComment()">Сохранить</button>
                    <button @click="cancelEdit">Отмена</button>
                </div>
               
                <!-- Edit/Delete buttons for the owner -->
                <div v-if=changeComment>
                <button @click="editComment(comment)">Редактировать</button>
                <button @click="deleteComment(comment.id)">Удалить</button>
                </div>
            </li>
            </ol>

          <p v-else>Комментариев пока нет.</p>
  
          <!-- New Comment Form -->
          <div v-if="isLoggedIn">
            <textarea v-model="newComment" placeholder="Оставить комментарий"></textarea>
            <button @click="submitNewComment()">Отправить</button>
          </div>
          <p v-else>Пожалуйста, войдите, чтобы оставить комментарий.</p>
        </div>
  
      
      </div>
    `,
    props: ['post'],
    data() {
      return {
        comments: [],
        newComment: '',
        isLoggedIn: true,
        editingCommentId: null,  // To track which comment is being edited
        changeComment:true,
      };
    },
   
  
        methods: {
            cancelEdit() {
                this.editingCommentId = null;  // Exit the editing mode
                this.newComment = '';  // Clear the form
                this.changeComment = true;
              },
               // Check if the logged-in user is the owner of the comment
               isCommentOwner(comment) {
                const currentUserId = localStorage.getItem('user_id'); // Get the current logged-in user's ID
                return currentUserId && currentUserId === comment.owner_id.toString();  // Compare with comment.owner_id
              },
              async refreshAccessToken() {
                const refreshToken = localStorage.getItem('refresh_token');
                if (!refreshToken) {
                    console.error('No refresh token found. Redirecting to login.');
                   alert('Токен не найден автоизуйтесь заново');
                    return false;
                }       
                try {
                    const response = await fetch('https://fastapi-app-0tqo.onrender.com/refresh', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            refresh_token: refreshToken  // Передаем refresh_token в теле запроса
                        })
                    });
            
                    if (response.ok) {
                        const data = await response.json();
                        // Сохраняем новый access_token
                        localStorage.setItem('access_token', data.access_token);
                        this.token = data.access_token;  // Обновляем токен в вашем приложении
                        return true;
                    } else {
                        console.error('Failed to refresh token:', await response.json());
                        return false;
                    }
                } catch (error) {
                    console.error('Error refreshing token:', error);
                    return false;
                }
            },
            async fetchComments(postId) {
                const token = localStorage.getItem('access_token'); // Получите токен из localStorage или другого источника
                if (!token) {
                  console.error('Нет токена доступа');
                  return;
                }
            
                try {
                  const response = await fetch(`https://fastapi-app-0tqo.onrender.com/posts/${postId}/comments`, {
                    headers: {
                      'Authorization': `Bearer ${token}`,
                    },
                  });
                  
                 
                    if (response.status === 401) {
                        // Если токен истек, пытаемся обновить его
                  
                        const refreshSuccessful = await this.refreshAccessToken();
                        if (refreshSuccessful) {
                            console.error('Access token  обновлен!');
                            // Повторяем запрос с новым токеном
                            return this.fetchComments(postId);
                        }
                    }
                  
            
                  this.comments = await response.json();
                  console.log("комментарии",this.comments);
                } catch (error) {
                  console.error('Ошибка загрузки комментариев:', error);
                }
              },
          
             
  
  // Method to delete a comment
  async deleteComment(commentId) {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    
    try {
      const response = await fetch(`https://fastapi-app-0tqo.onrender.com/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        this.comments = this.comments.filter(comment => comment.id !== commentId);
      } 
      else if (response.status === 401) {
        // Если токен истек, пытаемся обновить его
  
        const refreshSuccessful = await this.refreshAccessToken();
        if (refreshSuccessful) {
            console.error('Access token  обновлен!');
            // Повторяем запрос с новым токеном
            return this.deleteComment(commentId);
        }
    }
      else {
        console.error('Error deleting comment:', await response.text());
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
    },

    // Method to edit a comment
    editComment(comment) {
        this.newComment = comment.content;  // Pre-fill the comment form with the comment's content
        this.editingCommentId = comment.id;  // Track which comment is being edited
        this.changeComment = false;
    },

    async submitComment() {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        
        // If editing a comment
        if (this.editingCommentId) {
            try {
                const response = await fetch(`https://fastapi-app-0tqo.onrender.com/comments/${this.editingCommentId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ content: this.newComment }),
                });
    
                if (response.ok) {
                    const updatedComment = await response.json();
                    const index = this.comments.findIndex(comment => comment.id === this.editingCommentId);
                    if (index !== -1) {
                        this.comments.splice(index, 1, updatedComment); // Update the comment in the list
                    }
                    this.editingCommentId = null;  // Clear the editing state
                    this.newComment = '';  // Clear the form
                    this.changeComment = true; // Reset visibility state for buttons
                } else if (response.status === 401) {
                    // Если токен истек, пытаемся обновить его
              
                    const refreshSuccessful = await this.refreshAccessToken();
                    if (refreshSuccessful) {
                        console.error('Access token  обновлен!');
                        // Повторяем запрос с новым токеном
                        return this.submitComment();
                    }
                }
                 else {
                    console.error('Error updating comment:', await response.text());
                }
            } catch (error) {
                console.error('Error updating comment:', error);
            }
        } else {
            // Handle new comment submission
            this.submitNewComment();
        }
    },
    
    async submitNewComment() {
        const token = localStorage.getItem('access_token');
        if (!token) return;
    
        try {
            const response = await fetch(`https://fastapi-app-0tqo.onrender.com/posts/${this.post.id}/comments/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ content: this.newComment }),
            });
    
            if (response.ok) {
                const newComment = await response.json();
                this.comments.push(newComment); // Add the new comment to the comments array
                this.newComment = '';  // Clear the form after submission
            } 
            else if (response.status === 401) {
                // Если токен истек, пытаемся обновить его
          
                const refreshSuccessful = await this.refreshAccessToken();
                if (refreshSuccessful) {
                    console.error('Access token  обновлен!');
                    // Повторяем запрос с новым токеном
                    return this.submitNewComment();
                }
            }
            else {
                console.error('Error submitting new comment:', await response.text());
            }
        } catch (error) {
            console.error('Error submitting new comment:', error);
        }
    },
    
    
            closePost() {
                this.$emit('close-post'); // Эмитирует событие для родительского компонента
              },
            },
            watch: {
                post: {
                  immediate: true,  // Вызвать немедленно при первом рендере
                  handler(newPost) {
                    if (newPost) {
                      console.log('Post changed, fetching comments for post ID:', newPost.id);  // Отладка
                      this.fetchComments(newPost.id);
                    }
                  }
                }
              }
});
  

// frontend/app.js

Vue.component('clock-component', {
    template: `
      <div>
        <canvas id="canvas" width="150" height="150"></canvas>
      </div>
    `,
    mounted() {
      this.clock();
    },
    methods: {
      clock() {
        const ctx = document.getElementById('canvas').getContext('2d');
        const drawClock = () => {
          const now = new Date();
          ctx.clearRect(0, 0, 150, 150);
          ctx.save();
          ctx.translate(75, 75);
          ctx.scale(0.4, 0.4);
          ctx.rotate(-Math.PI / 2);
          ctx.strokeStyle = "black";
          ctx.fillStyle = "white";
          ctx.lineWidth = 8;
          ctx.lineCap = "round";
  
          
        // Hour marks
        ctx.save();
        for (var i = 0; i < 12; i++) {
          ctx.beginPath();
          ctx.rotate(Math.PI / 6);
          ctx.moveTo(100, 0);
          ctx.lineTo(120, 0);
          ctx.stroke();
        }
        ctx.restore();
  
        // Minute marks
        ctx.save();
        ctx.lineWidth = 5;
        for (var i = 0; i < 60; i++) {
          if (i % 5 !== 0) {
            ctx.beginPath();
            ctx.moveTo(117, 0);
            ctx.lineTo(120, 0);
            ctx.stroke();
          }
          ctx.rotate(Math.PI / 30);
        }
        ctx.restore();
  
        var sec = now.getSeconds();
        var min = now.getMinutes();
        var hr = now.getHours();
        hr = hr >= 12 ? hr - 12 : hr;
  
        ctx.fillStyle = "black";
  
        // Write Hours
        ctx.save();
        ctx.rotate(
          hr * (Math.PI / 6) + (Math.PI / 360) * min + (Math.PI / 21600) * sec
        );
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.moveTo(-20, 0);
        ctx.lineTo(80, 0);
        ctx.stroke();
        ctx.restore();
  
        // Write Minutes
        ctx.save();
        ctx.rotate((Math.PI / 30) * min + (Math.PI / 1800) * sec);
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(-28, 0);
        ctx.lineTo(112, 0);
        ctx.stroke();
        ctx.restore();
  
        // Write seconds
        ctx.save();
        ctx.rotate((sec * Math.PI) / 30);
        ctx.strokeStyle = "#D40000";
        ctx.fillStyle = "#D40000";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(-30, 0);
        ctx.lineTo(95, 0);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2, true);
        ctx.fill();
        // Эти строки создают кружок на конце секундной стрелки
        //ctx.beginPath();
        //ctx.arc(95, 0, 10, 0, Math.PI * 2, true);
        //ctx.stroke();
        //ctx.fillStyle = "rgba(0,0,0,0)";
        //ctx.arc(0, 0, 3, 0, Math.PI * 2, true);
        //ctx.fill();
        ctx.restore();
  
        // Clock frame
        ctx.beginPath();
        ctx.lineWidth = 14;
        ctx.strokeStyle = "#325FA2";
        ctx.arc(0, 0, 142, 0, Math.PI * 2, true);
        ctx.stroke();
  
  
          ctx.restore();
        };
        setInterval(drawClock, 1000);
      }
     
    }
  });

new Vue({
    el: '#app',
    data() {
        return {
            showLoginForm: false,
            showRegisterForm: false,
            token: localStorage.getItem('access_token') || null,
            loginMessage: '',
            registerMessage: '',
            showHelp: false
        };
    },
   
    methods: {          
        toggleHelp(){
            this.showHelp = !this.showHelp
        },
        toggleLoginForm() {
            this.showLoginForm = !this.showLoginForm;
            this.showRegisterForm = false;
            this.loginMessage = '';
        },
        toggleRegisterForm() {
            this.showRegisterForm = !this.showRegisterForm;
            this.showLoginForm = false;
            this.registerMessage = '';
        },
        handleLoginSuccess(token) {
            this.token = token;
            localStorage.setItem('access_token', token);
            this.loginMessage = 'Успешный вход!';
            this.showLoginForm = false;
        },
        logout() {
            this.token = null;
            localStorage.removeItem('access_token');
            this.loginMessage = '';
            this.registerMessage = '';
        }
    },
    template: `
        <div>
            <header class="header-content">
            
             <div id="hello" class="hello">
                    <span>H</span>
                    <span>E</span>
                    <span>L</span>
                    <span>L</span>
                    <span>O</span>
                    <span>!</span>
                </div>
                   
                <div class="nav container">
           
                    <!-- Logo -->
                     <div class="video-container">
                        <video class="up" id="catVideo" src="/video/hello.mp4" type="video/mp4"></video>
                    </div>
                      

                    <p  class="logo">Fast API-<span>Blog</span></p>
                   
                    <p style="width:100px;margin:0;"><img id="logoImg"  src="favicon.ico" width="100px" alt="logo" /></p>
                    <div>
                    
                            <button class="button_red" @click.stop="toggleLoginForm()">Login</button>
                            <button class="button_blue" @click.stop="toggleRegisterForm()">Register</button>
                            <button v-if="token" @click="logout()">Logout</button>
                            <button class="button_green" @click.stop="toggleHelp()">Help</button>
                                <div class="dark_label">
                                <input type="checkbox" id="dark-mode" class="input" />
                                <label for="dark-mode" class="label">
                                <div class="circle"></div></label>
                                </div>  
                    </div>
             
                    <!-- Используем новый компонент -->
                    <clock-component></clock-component>
                      
                </div>  
               
            </header>
     

            <div v-if="showHelp" style="margin-top:150px; color:green">
               <center><h2 style="width:800px;color:green">Поздравляю, Вы зашли в Fast API blog  то есть блог, который работает на основе python  FAST API fraimework!
               </h2></center>
               <p style="text-align:left;padding:20px">
              1. Для просмотра всех постов, а также  создания и редактирования своих собственных постов необходимо авторизоваться!<br/><br/>
               
              2. Посты вводятся в формате HTML с применением картинок(cтандартная картинка  - 'img/blog.jpg') и категорий: magic, gigong, info и health! <br/><br/>
            
              3. В конце каждого абзаца ставьте тег  br/ это будет переводить последующий текст на новую строчку. 
              </p>
              <center><h2 style="width:800px;color:green">Приятного просмотра!
               </h2></center>
              <hr>
               </div>
            <div v-if="showLoginForm" style="margin-top:50px">
                <login-form @login-success="handleLoginSuccess"></login-form>
                <p v-if="loginMessage">{{ loginMessage }}</p>
            </div>

            <div v-if="showRegisterForm" style="margin-top:150px">
                <register-form></register-form>
                <p v-if="registerMessage">{{ registerMessage }}</p>
            </div>

            <post-manager v-if="token" :token="token"></post-manager>
            <div v-else>
           <br/>  <br/>  <br/>  <br/>  <br/>  <br/>  <br/> 
           <h2 style="text-align:center">Вы зашли в закрытый блог! Для того чтобы просматривать, редактировать и удалять статьи необходимо зарегистрироватьcя!</h2>
           
                <p style="text-align:center"><img  src="img/blog.jpg"  alt="logo" /></p>
            </div>    
          
            
        </div>
    `
});


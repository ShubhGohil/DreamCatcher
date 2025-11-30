from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import AuthenticationForm
from django.shortcuts import render, redirect
from django.contrib import messages

# Create your views here.
def login_view(request):
    """
    Handles user login.
    If method is POST: Validates credentials and logs the user in.
    If method is GET: Renders the login form.
    """
    # If user is already logged in, don't show them the login page again
    if request.user.is_authenticated:
        return redirect('home')

    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')

            # Authenticate validates the credentials against the database
            user = authenticate(username=username, password=password)

            if user is not None:
                login(request, user)
                messages.success(request, f"Welcome back to the DreamCatcher, {username}.")
                return redirect('home')
            else:
                messages.error(request, "Invalid username or password.")
        else:
            messages.error(request, "Invalid username or password.")
    else:
        form = AuthenticationForm()

    return render(request, 'login.html', {'form': form})


def logout_view(request):
    """
    Logs the user out and redirects to login.
    """
    logout(request)
    messages.info(request, "You have woken up. (Logged out successfully)")
    return redirect('login')


def home_view(request):
    """
    The Dashboard.
    Strict Logic: If logged in -> Render Home. Else -> Kick to Login with message.
    """
    if request.user.is_authenticated:
        # User is allowed in. Render the dashboard.
        context = {
            'user': request.user,
            'dreams': [] # We will populate this from the database later
        }
        return render(request, 'home.html', context)
    else:
        # Security Guard: You are not on the list.
        messages.warning(request, "You must be authenticated to access DreamCatcher.")
        return redirect('login')
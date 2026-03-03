from flask import Blueprint, send_from_directory
import os

def load(app):
    """
    This function is called by CTFd when loading the theme.
    We use it to override specific routes with our React app.
    """
    
    # Get the theme directory
    theme_dir = os.path.dirname(os.path.abspath(__file__))
    static_dir = os.path.join(theme_dir, 'static')
    
    # Create a blueprint for our React app
    ramadhan = Blueprint(
        'ramadhan',
        __name__,
        static_folder='static',
        static_url_path='/themes/Ramadhan/static',
        template_folder='templates'
    )
    
    # Serve index.html for user-facing routes (GET only)
    # This allows the React router to handle all client-side navigation
    @ramadhan.route('/', methods=['GET'])
    @ramadhan.route('/login', methods=['GET'])
    @ramadhan.route('/register', methods=['GET'])
    @ramadhan.route('/challenges', methods=['GET'])
    @ramadhan.route('/challenges/<int:challenge_id>', methods=['GET'])
    @ramadhan.route('/scoreboard', methods=['GET'])
    @ramadhan.route('/teams', methods=['GET'])
    @ramadhan.route('/teams/<int:team_id>', methods=['GET'])
    @ramadhan.route('/profile', methods=['GET'])
    @ramadhan.route('/settings', methods=['GET'])
    @ramadhan.route('/users', methods=['GET'])
    @ramadhan.route('/users/<int:user_id>', methods=['GET'])
    def serve_react_app():
        """Serve the React app for user-facing routes (GET requests only)"""
        return send_from_directory(static_dir, 'index.html')
    
    # Register the blueprint BEFORE other routes
    # This ensures our routes take precedence over CTFd's default pages
    app.register_blueprint(ramadhan)
    
    return ramadhan

// My Courses page functionality
(function() {
  var API = '/api';
  var allEnrollments = [];

  function getAuthHeaders() {
    var token = localStorage.getItem('access_token');
    return token ? { 'Authorization': 'Bearer ' + token } : {};
  }

  async function checkAuth() {
    try {
      var r = await fetch(API + '/auth/me', { credentials: 'include', headers: getAuthHeaders() });
      if (!r.ok) return null;
      return await r.json();
    } catch (e) { return null; }
  }

  function renderCourseCard(enrollment) {
    var course = enrollment.course || {};
    // Fix: Use progress.percent from API, not progressPercentage
    var progress = enrollment.progress?.percent || 0;
    var status = enrollment.status || 'ACTIVE';
    // Fix: Use featuredImage from API, not thumbnail
    var thumbnail = course.featuredImage || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop';
    // Fix: Use course.id for learning URL, not slug
    var courseId = course.id;
    var lessonInfo = enrollment.progress ? enrollment.progress.completedLessons + '/' + enrollment.progress.totalLessons + ' lessons' : '';

    var statusBadge = status === 'COMPLETED'
      ? '<span class="course-badge completed">✓ Completed</span>'
      : '<span class="course-badge in-progress">In Progress</span>';

    return '<div class="course-card" data-status="' + (status === 'COMPLETED' ? 'completed' : 'in-progress') + '">' +
      '<div class="course-image-wrapper">' +
        '<img src="' + thumbnail + '" alt="' + (course.title || 'Course') + '" class="course-image" onerror="this.src=\'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop\'">' +
        '<div class="course-badge-wrapper">' + statusBadge + '</div>' +
      '</div>' +
      '<div class="course-content">' +
        '<h3 class="course-title">' + (course.title || 'Untitled Course') + '</h3>' +
        '<p class="course-lessons">' + lessonInfo + '</p>' +
        '<div class="progress-wrapper">' +
          '<div class="progress-header"><span>Progress</span><span>' + Math.round(progress) + '%</span></div>' +
          '<div class="progress-bar"><div class="progress-fill" style="width: ' + progress + '%;"></div></div>' +
        '</div>' +
        '<a href="/learn/' + courseId + '" class="btn btn-primary btn-full">' +
          (status === 'COMPLETED' ? '🔄 Review Course' : '▶ Continue Learning') +
        '</a>' +
      '</div>' +
    '</div>';
  }

  function renderCourses(filter) {
    var grid = document.getElementById('coursesGrid');
    var empty = document.getElementById('emptyState');

    var filtered = filter === 'all' ? allEnrollments : allEnrollments.filter(function(e) {
      if (filter === 'completed') return e.status === 'COMPLETED';
      return e.status !== 'COMPLETED';
    });

    if (filtered.length === 0) {
      grid.style.display = 'none';
      empty.style.display = 'block';
      return;
    }

    grid.style.display = 'grid';
    empty.style.display = 'none';
    grid.innerHTML = filtered.map(renderCourseCard).join('');
  }

  async function loadEnrollments() {
    var grid = document.getElementById('coursesGrid');
    try {
      var r = await fetch(API + '/lms/my-enrollments', { credentials: 'include', headers: getAuthHeaders() });
      if (!r.ok) throw new Error('Failed to load enrollments');
      allEnrollments = await r.json();
      console.log('Loaded enrollments:', allEnrollments);
      renderCourses('all');
    } catch (e) {
      console.error('Load enrollments error:', e);
      grid.innerHTML = '<div class="error-state">Failed to load courses. Please try again.</div>';
    }
  }

  function setupFilters() {
    var buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(function(btn) {
      btn.addEventListener('click', function() {
        buttons.forEach(function(b) { b.classList.remove('active'); });
        this.classList.add('active');
        renderCourses(this.getAttribute('data-filter'));
      });
    });
  }

  async function init() {
    var user = await checkAuth();
    if (!user) {
      document.getElementById('coursesGrid').style.display = 'none';
      document.getElementById('courseFilters').style.display = 'none';
      document.getElementById('notLoggedIn').style.display = 'block';
      return;
    }

    setupFilters();
    loadEnrollments();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


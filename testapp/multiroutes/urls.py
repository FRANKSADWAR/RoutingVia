from django.urls import include,path
from multiroutes import views
from django.urls import path,register_converter
from multiroutes import converters

register_converter(converters.FloatUrlParameterConverter,'float')

urlpatterns =[
    path('',views.home_page,name='home'),

    ## NEW URL Functionalities
    path('nearest_vertex/<float:lng>/<float:lat>/',views.get_nearest_vertex,name='nearest_vertex'),
    path('get_shortest_path/<int:source>/<int:target>/',views.get_shortest_path),
    path('get_shortest_path_obstacles/<int:source>/<int:target>/',views.get_shortest_path_obstacles),

]
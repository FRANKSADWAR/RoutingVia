from django.shortcuts import render
from django.db import models
from django.http import request,response,HttpResponseRedirect, JsonResponse
import psycopg2
from rest_framework.views import APIView
from geojson import loads, Feature, FeatureCollection


def home_page(request):
    return render(request,'index.html')


db = 'test_route'
passwd = 'RootRender90'
user =' postgres'

conn = psycopg2.connect(database=db,user=user,password=passwd)


## ---- URL VIEW TO GET THE NEAREST POINT, IT'LL BE USED AS AN AJAX REQUEST
def get_nearest_vertex(request,lng,lat):
    """
    This custome query gets the id nearest to the 
    coordinates provided and returns it
    """

    query = """
            SELECT id, ST_AsGeoJSON(the_geom) AS geom FROM searoutes_vertices_pgr ORDER BY 
            the_geom <-> ST_SetSRID(ST_MakePoint(%s, %s),4326) LIMIT 1;
            """
    cur = conn.cursor()
    cur.execute(query,(lng,lat))
    point = cur.fetchone()
    vertex_point = [point]

    vertex_result = []
    totalFeatures = len(vertex_point)
    for row in vertex_point:
        id_feature = row[0]
        geom = row[1]
        geom_json = loads(geom)
        segment_geom = Feature(geometry = geom_json, properties = {"id":id_feature})
        vertex_result.append(segment_geom)

    vertex_data = FeatureCollection(vertex_result, totalFeatures = totalFeatures)
    return JsonResponse(vertex_data)

def shortest_path(source,target):
    """
    This custom query is in charge of computing the shortest path bewteen two points at sea,
    the query then returns the geometry and route details. If the route intersects the ECA area, then the route length
    that intersects the ECA area is returned alongside the total length of the route itself. If there is no intersection, then
    the route length is returned and the eca distance is set to null.
    The values are converted to GeoJSON here.
    """

    query_ = " WITH route_dij AS (SELECT sea.id AS id, SUM(sea.length) AS length, "
    query_ +=  "SUM (dij.cost) AS cost, ST_Collect(sea.geom) AS geom "
    query_ +=  "FROM pgr_astar('SELECT id,source,target,cost,x1,y1,x2,y2,reverse_cost "
    query_ += "FROM searoutes',%s,%s) AS dij, "
    query_ += " searoutes AS sea WHERE dij.edge = sea.id GROUP BY sea.id) SELECT route_dij.id,"
    query_ +=  " route_dij.cost, ST_AsGeoJSON(route_dij.geom) AS the_geom, "          
    query_ += "route_dij.length,(SELECT SUM(ST_Length( (ST_Intersection(route.geom,eca.geom))::geography)/1852)"        
    query_ += " FROM eca_areas AS eca, route_dij AS route WHERE ST_Intersects(route.geom,eca.geom)) AS eca_distance FROM route_dij"
           
    with conn.cursor() as cursor:
        cursor.execute(query_,(source,target))
        rows = cursor.fetchall()
    return rows 


def get_shortest_path(request,source,target):

    datasets = shortest_path(source,target)

    total_length = []
    total_cost = []
    route_geometry = []
    eca_distance = []
    eca_value = 0
    for data in datasets:
        id_feature = data[0]
        cost = data[1]
        
        length = data[3]

        eca_value= data[-1]
        
        total_length.append(length)
        total_cost.append(cost)

        route_geom = data[2]
        route_json = loads(route_geom)
        data_geom = Feature(geometry=route_json,properties={"id":id_feature,"cost":cost,"length":length})
        route_geometry.append(data_geom)

    total_length = round(sum(total_length),4)
    total_cost = round(sum(total_cost),4)

    eca_distance.append(eca_value)

    if(isinstance(eca_distance[0],float)):
        eca_distance = round(sum(eca_distance),4)
    else:
        eca_distance = 0

    route_data = FeatureCollection(route_geometry,distance=total_length,cost=total_cost,eca_distance=eca_distance)
    return JsonResponse(route_data)
     

def shortest_path_obstacles(source,target):
    """
    This query returns the shortest path between points while avoiding the High Risk Areas, the query returned also
    contains the ECA distance if the area crosses an ECA distance or null otherwise.
    """
    
    query = " WITH route_dij AS (SELECT obst.gid AS id, SUM(obst.length) AS length, "
    query +=  "SUM (dij.cost) AS cost, ST_Collect(obst.geom) AS geom "
    query +=  "FROM pgr_astar('SELECT gid AS id, source, target, cost, x1, y1, x2, y2, reverse_cost "
    query += " FROM obstacles_route', %s,%s) AS dij, "
    query += " obstacles_route AS obst WHERE dij.edge = obst.gid GROUP BY obst.gid) SELECT route_dij.id,"
    query +=  " route_dij.cost, ST_AsGeoJSON(route_dij.geom) AS the_geom, "          
    query += "route_dij.length,(SELECT SUM(ST_Length((ST_Intersection(route.geom,eca.geom))::geography)/1852)"        
    query += " FROM eca_areas AS eca, route_dij AS route WHERE ST_Intersects(route.geom,eca.geom)) AS eca_distance FROM route_dij"

    with conn.cursor() as cursor:
        cursor.execute(query,(source,target))
        rows = cursor.fetchall()
    return rows  


def get_shortest_path_obstacles(request,source,target):

    raw_datasets = shortest_path_obstacles(source,target)

    total_length = []
    total_cost = []
    route_geometry = []
    eca_value = 0

    try:
        eca_distance = []
        for dataset in raw_datasets:
            id_feature = dataset[0]
            cost = dataset[1]
            length = dataset[3]
            eca_value = dataset[-1]

            total_length.append(length)
            total_cost.append(cost)

            route_geom = dataset[2]
            route_json = loads(route_geom)
            data_geom = Feature(geometry=route_json,properties={"id":id_feature,"cost":cost,"length":length})
            route_geometry.append(data_geom)

        total_length = round(sum(total_length),4)
        total_cost = round(sum(total_cost),4)

        eca_distance.append(eca_value)  

        if (isinstance(eca_distance[0],float)):
            eca_distance = round(sum(eca_distance),4)
        else:    
            eca_distance = 0

        route_info = FeatureCollection(route_geometry,distance=total_length,cost=total_cost,eca_distance=eca_distance)
        return JsonResponse(route_info)
    except:
        return 0

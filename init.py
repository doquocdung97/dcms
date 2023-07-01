import requests
import json
import time
url = "http://localhost:5000/graphql"
 
body = """
mutation CreateBlog($input: InputBlog) {
  createBlog(input: $input) {
    code
    success
    data {
       id
        age
        name
        type
        listtype
        image {
          id
          name
          url
          createdAt
          updatedAt
        }
        images {
          id
          name
          url
          createdAt
          updatedAt
        }
        createdAt
        updatedAt
    }
  }
}
"""
for i in range(1000):
	time.sleep(1)
	variables = {
		"input": {
			"age": i,
			"name": f"name {i}",
			"listtype": ["TEST1","TEST2"],
			"type":"TEST2",
		}
	}
	response = requests.post(url=url, json={"query": body,"variables":variables})
	print("response status code: ", response.status_code)
	if response.status_code == 200:
			print("response : ",response.content)
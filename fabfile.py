from fabric.api import local

def serve():
    local("cp -rf build docs/")
    local("npm run dev")

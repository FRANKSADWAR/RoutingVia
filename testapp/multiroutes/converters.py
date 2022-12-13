"""
Converting the float URLs in the path function
"""
class FloatUrlParameterConverter:
    regex = regex = '[-+]?\d+(\.\d+)'

    def to_python(self,value):
        return float(value)

    def to_url(self,value):
        return str(value)

import re

with open('prisma/schema.prisma', 'r') as f:
    content = f.read()

# Additional specific fixes for Post/Page author relation
# Post has "user User @relation(fields: [authorId]" but code expects "author"
content = re.sub(
    r'(model Post \{[^}]*?)\buser(\s+User\s+@relation\(fields: \[authorId\])',
    r'\1author\2',
    content,
    flags=re.DOTALL
)

content = re.sub(
    r'(model Page \{[^}]*?)\buser(\s+User\s+@relation\(fields: \[authorId\])',
    r'\1author\2',
    content,
    flags=re.DOTALL
)

with open('prisma/schema.prisma', 'w') as f:
    f.write(content)

print('Fixed Post and Page author relations')


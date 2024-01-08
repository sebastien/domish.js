scopes = {}
with open("tags") as f:
    for line in f.readlines():
        _ = line.split("\t")
        name = _[0]
        if (
            name.startswith("_")
            or name == "constructor"
            or name.startswith("anonymous")
        ):
            continue
        type_scope = _[-1].strip("\n").split(":")
        if len(type_scope) == 2:
            type, scope = type_scope
            t = _[-2]
            scope = scope.split(".")[0]
            scopes.setdefault(scope, {})[name] = t
for k in sorted(list(scopes)):
    print(f"- {k}")
    d = scopes[k]
    for kk in sorted(list(d)):
        print(f"  - {kk}{'()' if d[kk] == 'm' else ''}")

# EOF

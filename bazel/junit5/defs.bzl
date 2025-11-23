load("@rules_kotlin//kotlin:jvm.bzl", "kt_jvm_library", "kt_jvm_test")

def kt_jvm_junit5_test(name, srcs = [], test_package = None, deps = [], runtime_deps = [], **kwargs):
    """Generates kotlin test targets that run using junit 5"""

    # args to ignore
    FILTER_KWARGS = [
        "main_class",
        "args",
    ]

    for arg in FILTER_KWARGS:
        if arg in kwargs.keys():
            kwargs.pop(arg)

    if not test_package:
        fail("must specify test package")

    if not srcs:
        fail("must specify sources")

    # Add all the test deps here instead of per test bazel file
    test_deps = [
        "@maven//:org_junit_jupiter_junit_jupiter_api",
        "@maven//:org_junit_jupiter_junit_jupiter_engine",
        "@maven//:org_junit_jupiter_junit_jupiter_params",
        "@maven//:org_junit_platform_junit_platform_suite_api",
    ]
    test_runtime_deps = [
        "@maven//:org_junit_platform_junit_platform_commons",
        "@maven//:org_junit_platform_junit_platform_console",
        "@maven//:org_junit_platform_junit_platform_engine",
        "@maven//:org_junit_platform_junit_platform_launcher",
        "@maven//:org_junit_platform_junit_platform_suite_api",
    ]

    # If we dynamically generate tests with new names, create a suite with the name provided by the user
    # so they can still run all tests using the target in their build file.
    test_suite_tests = []

    # Generate a test rule for each class
    for src in srcs:
        classname = src[:src.rfind(".")]  # strip '.<extension>'
        _rule_kt_test(
            srcs = [src],
            name = classname,
            deps = depset(deps + test_deps).to_list(),
            test_package = test_package,
            runtime_deps = depset(runtime_deps + test_runtime_deps).to_list(),
            **kwargs
        )
        if name != classname:
            test_suite_tests.append(classname)

    if test_suite_tests:
        native.test_suite(
            name = name,
            tags = kwargs.get("tags", []),
            tests = test_suite_tests,
            visibility = ["//:__subpackages__"],
        )

def _rule_kt_test(name, test_package, srcs = [], runtime_deps = [], **kwargs):
    """Helper macro for calling kt_jvm_test"""
    args = [
        "--disable-banner",
        "--include-classname=.*",
    ]

    if "/" in name:
        args.append("--select-package")
        args.append(test_package)
    else:
        args.append("--select-class")
        args.append(test_package + "." + name[name.rfind("/") + 1:])

    kt_jvm_test(
        name = name,
        srcs = srcs,
        testonly = True,
        main_class = "org.junit.platform.console.ConsoleLauncher",
        args = args,
        runtime_deps = runtime_deps,
        **kwargs
    )

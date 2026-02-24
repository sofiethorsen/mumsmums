load("@contrib_rules_jvm//java:defs.bzl", "java_junit5_test")
load("@rules_kotlin//kotlin:jvm.bzl", "kt_jvm_library")

def kt_jvm_junit5_test(name, srcs = [], test_package = None, deps = [], runtime_deps = [], associates = [], **kwargs):
    """Generates Kotlin JUnit 5 test targets using contrib_rules_jvm's java_junit5_test runner.

    Each source file becomes its own test target. The java_junit5_test runner supports
    TESTBRIDGE_TEST_ONLY, which is the environment variable Bazel uses to pass --test_filter
    values. This allows running individual test methods via `bazel test --test_filter=methodName`
    or from IDE integrations that set this variable.
    """

    if not test_package:
        fail("must specify test package")

    if not srcs:
        fail("must specify sources")

    test_deps = [
        "@maven//:org_junit_jupiter_junit_jupiter_api",
        "@maven//:org_junit_jupiter_junit_jupiter_engine",
        "@maven//:org_junit_jupiter_junit_jupiter_params",
        "@maven//:org_junit_platform_junit_platform_suite_api",
    ]

    test_runtime_deps = [
        "@maven//:org_junit_platform_junit_platform_commons",
        "@maven//:org_junit_platform_junit_platform_engine",
        "@maven//:org_junit_platform_junit_platform_launcher",
        "@maven//:org_junit_platform_junit_platform_reporting",
    ]

    all_deps = deps + test_deps
    all_runtime_deps = runtime_deps + test_runtime_deps

    test_suite_tests = []

    for src in srcs:
        classname = src[:src.rfind(".")]
        fully_qualified_class_name = test_package + "." + classname
        lib_name = classname + "_lib"

        kt_jvm_library(
            name = lib_name,
            srcs = [src],
            deps = all_deps,
            associates = associates,
            testonly = True,
        )

        java_junit5_test(
            name = classname,
            test_class = fully_qualified_class_name,
            runtime_deps = [":" + lib_name] + all_runtime_deps,
            **kwargs
        )

        if name != classname:
            test_suite_tests.append(classname)

    # When multiple srcs are provided, create a test_suite so the caller's `name`
    # works as a single target that runs all individual test targets.
    if test_suite_tests:
        native.test_suite(
            name = name,
            tags = kwargs.get("tags", []),
            tests = test_suite_tests,
            visibility = ["//:__subpackages__"],
        )

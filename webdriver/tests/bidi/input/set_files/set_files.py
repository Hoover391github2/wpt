import pytest

from .. import get_events
from webdriver.bidi.error import NoSuchElementException, UnableToSetFileInputException

pytestmark = pytest.mark.asyncio


async def test_set_files(
    bidi_session,
    top_context,
    load_static_test_page,
    get_element,
):
    await load_static_test_page(page="files.html")

    element = await get_element("#input")

    await bidi_session.input.set_files(
        context=top_context["context"],
        element={"sharedId": element["sharedId"]},
        files=["path/to/noop.txt"],
    )

    events = await get_events(bidi_session, top_context["context"])
    assert events == [
        {
            "files": [
                "noop.txt",
            ],
            "type": "input",
        },
        {
            "files": [
                "noop.txt",
            ],
            "type": "change",
        },
    ]


async def test_set_files_empty(
    bidi_session,
    top_context,
    load_static_test_page,
    get_element,
):
    await load_static_test_page(page="files.html")

    element = await get_element("#input")

    await bidi_session.input.set_files(
        context=top_context["context"],
        element={"sharedId": element["sharedId"]},
        files=[],
    )

    events = await get_events(bidi_session, top_context["context"])
    assert events == [
        {
            "files": [],
            "type": "cancel",
        },
    ]


async def test_set_files_something_then_empty(
    bidi_session,
    top_context,
    load_static_test_page,
    get_element,
):
    await load_static_test_page(page="files.html")

    element = await get_element("#input")

    await bidi_session.input.set_files(
        context=top_context["context"],
        element={"sharedId": element["sharedId"]},
        files=["path/to/noop.txt"],
    )

    await bidi_session.input.set_files(
        context=top_context["context"],
        element={"sharedId": element["sharedId"]},
        files=[],
    )

    events = await get_events(bidi_session, top_context["context"])
    assert events == [
        {
            "files": [
                "noop.txt",
            ],
            "type": "input",
        },
        {
            "files": [
                "noop.txt",
            ],
            "type": "change",
        },
        {
            "files": [],
            "type": "input",
        },
        {
            "files": [],
            "type": "change",
        },
    ]


async def test_set_files_twice(
    bidi_session,
    top_context,
    load_static_test_page,
    get_element,
):
    await load_static_test_page(page="files.html")

    element = await get_element("#input")

    await bidi_session.input.set_files(
        context=top_context["context"],
        element={"sharedId": element["sharedId"]},
        files=["path/to/noop.txt"],
    )

    await bidi_session.input.set_files(
        context=top_context["context"],
        element={"sharedId": element["sharedId"]},
        files=["path/to/noop-2.txt"],
    )

    events = await get_events(bidi_session, top_context["context"])
    assert events == [
        {
            "files": [
                "noop.txt",
            ],
            "type": "input",
        },
        {
            "files": [
                "noop.txt",
            ],
            "type": "change",
        },
        {
            "files": [
                "noop-2.txt",
            ],
            "type": "input",
        },
        {
            "files": [
                "noop-2.txt",
            ],
            "type": "change",
        },
    ]


async def test_set_files_twice_same(
    bidi_session,
    top_context,
    load_static_test_page,
    get_element,
):
    await load_static_test_page(page="files.html")

    element = await get_element("#input")

    await bidi_session.input.set_files(
        context=top_context["context"],
        element={"sharedId": element["sharedId"]},
        files=["path/to/noop.txt"],
    )

    await bidi_session.input.set_files(
        context=top_context["context"],
        element={"sharedId": element["sharedId"]},
        files=["path/to/noop.txt"],
    )

    events = await get_events(bidi_session, top_context["context"])
    assert events == [
        {
            "files": [
                "noop.txt",
            ],
            "type": "input",
        },
        {
            "files": [
                "noop.txt",
            ],
            "type": "change",
        },
        {
            "files": [
                "noop.txt",
            ],
            "type": "cancel",
        },
    ]


async def test_set_files_missing_element(
    bidi_session,
    top_context,
    load_static_test_page,
):
    await load_static_test_page(page="files.html")

    with pytest.raises(NoSuchElementException):
        await bidi_session.input.set_files(
            context=top_context["context"],
            element={"sharedId": "invalid"},
            files=["path/to/noop.txt"],
        )


async def test_set_files_missing_element_empty(
    bidi_session,
    top_context,
    load_static_test_page,
):
    await load_static_test_page(page="files.html")

    with pytest.raises(NoSuchElementException):
        await bidi_session.input.set_files(
            context=top_context["context"],
            element={"sharedId": "invalid"},
            files=[],
        )


async def test_set_files_invalid_element(
    bidi_session,
    top_context,
    load_static_test_page,
    get_element,
):
    await load_static_test_page(page="files.html")

    element = await get_element("#input-disabled")

    with pytest.raises(UnableToSetFileInputException):
        await bidi_session.input.set_files(
            context=top_context["context"],
            element=element,
            files=["path/to/noop.txt"],
        )


async def test_set_files_invalid_element_empty(
    bidi_session,
    top_context,
    load_static_test_page,
    get_element,
):
    await load_static_test_page(page="files.html")

    element = await get_element("#input-disabled")

    with pytest.raises(UnableToSetFileInputException):
        await bidi_session.input.set_files(
            context=top_context["context"],
            element=element,
            files=[],
        )
